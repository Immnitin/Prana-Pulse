import pickle
import pandas as pd
import os
import requests
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv # Import the new library

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Securely get the API key from the environment variable
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize the Flask application
app = Flask(__name__)

# --- Load Local Models and Scalers ---
try:
    hd_model = pickle.load(open('heart_disease_model.sav', 'rb'))
    hd_scaler = pickle.load(open('scaler.sav', 'rb'))
    db_model = pickle.load(open('diabetes_model.sav', 'rb'))
    db_scaler = pickle.load(open('diabetes_scaler.sav', 'rb'))
    print("All local models and scalers loaded successfully.")
except FileNotFoundError as e:
    print(f"CRITICAL ERROR: Could not load a model or scaler file. {e}")
    hd_model, hd_scaler, db_model, db_scaler = None, None, None, None

# --- LLM Helper Function (Updated for Indian Context) ---
def generate_detailed_llm_response(disease_name, risk_status, user_data, diet_focus):
    """
    Calls an LLM to generate a detailed, structured JSON response with comprehensive explanations
    tailored for an Indian audience.
    """
    user_data_summary = json.dumps(user_data)

    prompt = f"""
    You are an expert AI health analyst with deep knowledge of Indian culture and cuisine. Your task is to analyze a health risk assessment for a user from India and provide a detailed, structured, and empathetic explanation in JSON format.

    **Health Assessment Summary:**
    - **Condition:** {disease_name}
    - **Calculated Risk Level:** {risk_status}
    - **User's Health Data (in JSON format):** {user_data_summary}

    **Instructions:**
    Generate a JSON object with the exact following keys: "risk_assessment", "key_factors_analysis", "lifestyle_recommendations", "diet_plan".

    1.  **risk_assessment**: (String) Write a gentle, clear summary of the risk level.

    2.  **key_factors_analysis**: (String) Provide a "Health Vitals Report Card". Analyze EACH of the user's data points. For each factor, comment on whether the value is in a healthy range, borderline, or a risk factor, and briefly explain its significance. Use '\\n' for new lines.

    3.  **lifestyle_recommendations**: (String) Provide an elaborated guide for lifestyle changes relevant to an Indian context. Cover these areas:
        - **Physical Activity:** Suggest accessible activities like brisk walking, cycling, or incorporating yoga and pranayama into the daily routine. Mention frequency and duration.
        - **Stress Management:** Recommend techniques like meditation (dhyana), mindfulness, and deep breathing exercises.
        - **Sleep:** Emphasize the importance of 7-8 hours of quality sleep.

    4.  **diet_plan**: (String) This is very important. Provide a "Sample 3-Day Indian Meal Plan" focusing on '{diet_focus}'. The plan must include common Indian dishes for Breakfast, Lunch, and Dinner. For example, suggest items like poha, idli, roti (whole wheat), dal, sabzi (seasonal vegetables), salads, and curd. Emphasize using whole grains and reducing oil and sugar.

    IMPORTANT: The entire output must be a single, valid JSON object. Do not include any text before or after the JSON.
    """

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            })
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']

    except requests.exceptions.RequestException as e:
        print(f"Error calling LLM: {e}")
        return json.dumps({
            "risk_assessment": "Error: Could not generate AI analysis.",
            "key_factors_analysis": "There was an issue analyzing the provided health data.",
            "lifestyle_recommendations": "Please consult a healthcare professional for guidance.",
            "diet_plan": "Dietary recommendations could not be generated at this time."
        })

# --- API Endpoints (Updated to pass the new diet focus) ---
@app.route('/predict/heart', methods=['POST'])
def predict_heart():
    user_data = request.get_json()
    try:
        required_columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        input_df = pd.DataFrame([user_data])[required_columns]
        input_scaled = hd_scaler.transform(input_df)
        
        prediction = hd_model.predict(input_scaled)[0]
        risk_probability = hd_model.predict_proba(input_scaled)[0][1]
        
        risk_status = "High" if prediction == 1 else "Low"
        
        llm_json_string = generate_detailed_llm_response(
            disease_name="Heart Disease",
            risk_status=risk_status,
            user_data=user_data,
            diet_focus="heart-healthy Indian cuisine (low sodium, less oil, high fiber)"
        )
        
        final_response = {
            "risk_score": round(risk_probability, 2),
            "explanation": json.loads(llm_json_string)
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 400


@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    user_data = request.get_json()
    try:
        model_columns = ['age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level', 'blood_glucose_level', 'gender_Male', 'smoking_history_No Info', 'smoking_history_current', 'smoking_history_ever', 'smoking_history_former', 'smoking_history_not current']
        input_df = pd.DataFrame(columns=model_columns, index=[0]).fillna(0)
        for key, value in user_data.items():
            if key in model_columns:
                input_df.loc[0, key] = value
        if 'gender' in user_data and user_data['gender'] == 'Male':
            input_df.loc[0, 'gender_Male'] = 1
        if 'smoking_history' in user_data:
            smoking_col = f"smoking_history_{user_data['smoking_history']}"
            if smoking_col in model_columns:
                input_df.loc[0, smoking_col] = 1
        
        numerical_cols = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level']
        input_df[numerical_cols] = db_scaler.transform(input_df[numerical_cols])
        
        prediction = db_model.predict(input_df)[0]
        risk_probability = db_model.predict_proba(input_df)[0][1]

        risk_status = "High" if prediction == 1 else "Low"
        
        llm_json_string = generate_detailed_llm_response(
            disease_name="Type 2 Diabetes",
            risk_status=risk_status,
            user_data=user_data,
            diet_focus="diabetic-friendly Indian cuisine (low glycemic index, whole grains like atta and millets, lean protein)"
        )

        final_response = {
            "risk_score": round(risk_probability, 2),
            "explanation": json.loads(llm_json_string)
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 400

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True, port=5000)