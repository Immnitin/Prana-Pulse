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
    You are an expert AI health analyst with deep knowledge of Indian culture and cuisine. Your task is to analyze a health risk assessment and provide a detailed, structured, and empathetic explanation in JSON format. The tone should be professional, reassuring, and highly refined.

    **Health Assessment Summary:**
    - **Condition:** {disease_name}
    - **Calculated Risk Level:** {risk_status}
    - **User's Health Data:** {user_data_summary}

    **Instructions:**
    Generate a JSON object with the exact following keys: "AI_Clinical_Assessment", "Risk_Factor_Analysis", "Lifestyle_Recommendations", "Personal_Nutrition_Plan".

    1.  **"AI_Clinical_Assessment"**: (String) Write a gentle, clear, and elaborated summary of the risk level. Explain what the risk level implies in a reassuring manner. Do not use asterisks or markdown.

    2.  **"Risk_Factor_Analysis"**: (Object) This is critical. Create a JSON object where each key is a parameter from the user's health data (e.g., "age", "trestbps"). The value for each key must be a string providing a concise but insightful analysis of that specific parameter (e.g., "A cholesterol level of 233 mg/dL is considered borderline high. In the Indian context, where diets can be rich in fats, managing this is key to preventing plaque buildup in arteries.").

    3.  **"Lifestyle_Recommendations"**: (String) Provide a refined, paragraph-style guide for lifestyle changes relevant to an Indian context. Use '\\n' for paragraph breaks. Elaborate on:
        - **Physical Activity:** Suggest accessible activities like post-dinner walks (a common Indian practice), cycling, or incorporating specific yoga asanas like Surya Namaskar.
        - **Stress Management:** Recommend techniques like meditation (dhyana), pranayama (like Anulom Vilom), and mindfulness.
        - **Sleep:** Emphasize the importance of a consistent sleep schedule.

    4.  **"Personal_Nutrition_Plan"**: (Object) Provide a "Sample 3-Day Indian Meal Plan" focusing on '{diet_focus}'. The JSON object should have three keys: "Day1", "Day2", and "Day3". The value for each day should be a string detailing Breakfast, Lunch, and Dinner. Be specific with dishes (e.g., "Breakfast: 2 vegetable idlis with a small bowl of sambar."). Emphasize healthy cooking methods like steaming or using an air fryer instead of deep frying.

    IMPORTANT: Your entire response must be ONLY the JSON object. Do not add any introductory text like 'Here is the JSON you requested.' or any text after the final closing brace. Ensure all strings are properly quoted and escaped.
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
            **explanation_json
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred during local prediction: {str(e)}"}), 400


@app.route('/predict/diabetes', methods=['POST'])
def predict_diabetes():
    user_data = request.get_json()
    try:
        # This list of columns now perfectly matches the columns created by the training script
        model_columns = [
            'age', 'hypertension', 'heart_disease', 'bmi', 'HbA1c_level',
            'blood_glucose_level', 'gender_Male', 'smoking_history_current',
            'smoking_history_ever', 'smoking_history_former',
            'smoking_history_never', 'smoking_history_not current'
        ]
        
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
            **explanation_json
        }
        return jsonify(final_response)

    except Exception as e:
        return jsonify({'error': f"An error occurred during local prediction: {str(e)}"}), 400

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
