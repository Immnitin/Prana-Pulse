# # -*- coding: utf-8 -*-
# import sklearn
# import numpy as np
# import pandas as pd
# from sklearn.model_selection import train_test_split
# from sklearn.linear_model import LogisticRegression
# from sklearn.metrics import accuracy_score
# from sklearn.preprocessing import StandardScaler

# """Data Collection and Processing"""

# # loading the csv data to a Pandas DataFrame
# heart_data = pd.read_csv('D:\\projects\\iarehackathon_project\\backend\\heart_disease_data.csv')

# # print first 5 rows of the dataset
# heart_data.head()

# # print last 5 rows of the dataset
# heart_data.tail()

# # number of rows and columns in the dataset
# heart_data.shape

# # getting some info about the data
# heart_data.info()

# # checking for missing values
# heart_data.isnull().sum()

# # statistical measures about the data
# heart_data.describe()

# # checking the distribution of Target Variable
# heart_data['target'].value_counts()

# """1 --> Defective Heart

# 0 --> Healthy Heart

# Splitting the Features and Target
# """

# X = heart_data.drop(columns='target', axis=1)
# Y = heart_data['target']

# print(X)

# X.info()

# print(Y)

# """### **Data Standardization**"""

# scaler = StandardScaler()

# scaler.fit(X)

# standardized_data = scaler.transform(X)

# # print(standardized_data)

# X = standardized_data
# Y = heart_data['target']

# print(X)
# print(Y)

# """### **Splitting the Data into Training data & Test Data**"""

# X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, stratify=Y, random_state=2)

# print(X.shape, X_train.shape, X_test.shape)

# """Model Training

# Logistic Regression
# """

# model = LogisticRegression()

# # training the LogisticRegression model with Training data
# model.fit(X_train, Y_train)

# import pickle

# # Save the scaler object to a file
# with open('scaler.sav', 'wb') as scaler_file:
#     pickle.dump(scaler, scaler_file)

# print("Scaler has been saved to scaler.sav")

# """*Model* Evaluation

# Accuracy Score
# """

# # accuracy on training data
# X_train_prediction = model.predict(X_train)
# training_data_accuracy = accuracy_score(X_train_prediction, Y_train)

# print('Accuracy on Training data : ', training_data_accuracy)

# # accuracy on test data
# X_test_prediction = model.predict(X_test)
# test_data_accuracy = accuracy_score(X_test_prediction, Y_test)

# print('Accuracy on Test data : ', test_data_accuracy)

# """### **Building a Predictive System**"""

# input_data = (57,	0	,0	,120	,354	,0	,1	,163	,1	,0.6	,2	,0	,2)

# # change the input data to a numpy array
# input_data_as_numpy_array= np.asarray(input_data)
# print(input_data_as_numpy_array.dtype)

# # reshape the numpy array as we are predicting for only on instance
# input_data_reshaped = input_data_as_numpy_array.reshape(1,-1)
# print(input_data_reshaped.dtype)

# prediction = model.predict(input_data_reshaped)
# print(prediction)

# if (prediction[0]== 0):
#   print('The Person does not have a Heart Disease')
# else:
#   print('The Person has Heart Disease')

# """### **Saving the trained model**"""

# import pickle

# filename = 'heart_disease_model.sav'
# pickle.dump(model, open(filename, 'wb'))

# # loading the saved model
# loaded_model = pickle.load(open('heart_disease_model.sav', 'rb'))

# # Accessing the column names from the original heart_data DataFrame
# for column in heart_data.drop(columns='target').columns:
#   print(column)

# print(sklearn.__version__)

import pandas as pd
import numpy as np
import pickle
import shap
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score, brier_score_loss

print("--- Advanced Heart Disease Model Training Pipeline ---")

# --- 1. Data Loading (Using Relative Path) ---
try:
    # This will look for the CSV in the same folder the script is run from.
    heart_data = pd.read_csv('heart_disease_data.csv')
    print("Heart disease dataset loaded successfully.")
except FileNotFoundError:
    print("Error: 'heart_disease_data.csv' not found. Make sure it is in the '/backend' folder.")
    exit()

# --- 2. Feature and Target Separation ---
X_features = heart_data.drop(columns='target', axis=1)
Y_target = heart_data['target']
print("Features and target separated.")

# --- 3. Train-Test Split ---
X_train_df, X_test_df, Y_train, Y_test = train_test_split(X_features, Y_target, test_size=0.2, stratify=Y_target, random_state=42)
print("Data split into training and testing sets.")

# --- 4. Data Standardization ---
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_df)
X_test_scaled = scaler.transform(X_test_df)
print("Data has been standardized.")

# --- 5. Model Training ---
model = LogisticRegression(solver='liblinear')
model.fit(X_train_scaled, Y_train)
print("Heart disease model training complete.")

# --- 6. Advanced Model Evaluation ---
print("\n--- Model Performance Metrics ---")
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

accuracy = accuracy_score(Y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")

auroc = roc_auc_score(Y_test, y_pred_proba)
print(f"AUROC Score: {auroc:.4f}")

brier_score = brier_score_loss(Y_test, y_pred_proba)
print(f"Brier Score Loss: {brier_score:.4f}")

# --- 7. Save the Final Model and Scaler ---
print("\n--- Saving Final Artifacts ---")
with open('heart_disease_model.sav', 'wb') as model_file:
    pickle.dump(model, model_file)
print("Model saved successfully as 'heart_disease_model.sav'")

with open('scaler.sav', 'wb') as scaler_file:
    pickle.dump(scaler, scaler_file)
print("Scaler for heart disease model saved successfully as 'scaler.sav'")
