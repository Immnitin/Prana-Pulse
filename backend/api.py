import pickle
import pandas as pd
import os
import requests
import json
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Securely get the API key from the environment variable
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    print("CRITICAL ERROR: OPENROUTER_API_KEY not found in .env file.")

# Initialize the Flask application
app = Flask(__name__)

CORS(app) 

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

# --- LLM Helper Function (Updated with more robust prompt) ---
def generate_detailed_llm_response(disease_name, risk_status, user_data, diet_focus):
    """
    Calls an LLM to generate a detailed, structured JSON response with comprehensive explanations
    tailored for an Indian audience.
    """
    user_data_summary = json.dumps(user_data)

    prompt = f"""
    You are an expert AI health analyst. Your task is to analyze a health risk assessment and provide a detailed explanation in JSON format.

    **Health Assessment Summary:**
    - **Condition:** {disease_name}
    - **Risk Level:** {risk_status}
    - **User's Data:** {user_data_summary}

    **Instructions:**
    Generate a JSON object with the exact keys: "risk_assessment", "key_factors_analysis", "lifestyle_recommendations", "diet_plan".
    - The value for each key MUST be a single string.
    - To create new lines or bullet points within a string, you MUST use the '\\n' character.
    - Ensure the final output is a single, perfectly valid JSON object and nothing else.

    1.  **risk_assessment**: Write a gentle summary of the risk level.
    2.  **key_factors_analysis**: Provide a "Health Vitals Report Card". Analyze EACH user data point. Comment on whether the value is healthy, borderline, or a risk factor, and explain its significance.
    3.  **lifestyle_recommendations**: Provide an elaborated guide for lifestyle changes relevant to an Indian context (yoga, pranayama, walking). Cover Physical Activity, Stress Management, and Sleep.
    4.  **diet_plan**: Provide a "Sample 3-Day Indian Meal Plan" focusing on '{diet_focus}'. Include common Indian dishes for Breakfast, Lunch, and Dinner.

    Your entire response must be only the JSON object.
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
        return json.dumps({"error": "Could not connect to the AI analysis service."})

# --- API Endpoints (Updated with better error handling) ---
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
        
        try:
            # Attempt to parse the string from the LLM into a JSON object
            explanation_json = json.loads(llm_json_string)
        except json.JSONDecodeError as e:
            # If parsing fails, log the error and the bad response from the LLM
            print(f"--- LLM JSON PARSE ERROR ---")
            print(f"Error: {e}")
            print(f"Raw LLM Response:\n{llm_json_string}")
            print(f"--------------------------")
            # Return a user-friendly error in the final JSON
            explanation_json = {"error": "The AI-generated analysis was malformed. Please try again."}

        final_response = {
            "risk_score": round(risk_probability, 2),
            "explanation": explanation_json
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred during local prediction: {str(e)}"}), 400


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

        try:
            explanation_json = json.loads(llm_json_string)
        except json.JSONDecodeError as e:
            print(f"--- LLM JSON PARSE ERROR ---")
            print(f"Error: {e}")
            print(f"Raw LLM Response:\n{llm_json_string}")
            print(f"--------------------------")
            explanation_json = {"error": "The AI-generated analysis was malformed. Please try again."}

        final_response = {
            "risk_score": round(risk_probability, 2),
            "explanation": explanation_json
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred during local prediction: {str(e)}"}), 400

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
