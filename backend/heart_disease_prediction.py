# -*- coding: utf-8 -*-
import sklearn
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler

"""Data Collection and Processing"""

# loading the csv data to a Pandas DataFrame
heart_data = pd.read_csv('D:\\projects\\iarehackathon_project\\backend\\heart_disease_data.csv')

# print first 5 rows of the dataset
heart_data.head()

# print last 5 rows of the dataset
heart_data.tail()

# number of rows and columns in the dataset
heart_data.shape

# getting some info about the data
heart_data.info()

# checking for missing values
heart_data.isnull().sum()

# statistical measures about the data
heart_data.describe()

# checking the distribution of Target Variable
heart_data['target'].value_counts()

"""1 --> Defective Heart

0 --> Healthy Heart

Splitting the Features and Target
"""

X = heart_data.drop(columns='target', axis=1)
Y = heart_data['target']

print(X)

X.info()

print(Y)

"""### **Data Standardization**"""

scaler = StandardScaler()

scaler.fit(X)

standardized_data = scaler.transform(X)

# print(standardized_data)

X = standardized_data
Y = heart_data['target']

print(X)
print(Y)

"""### **Splitting the Data into Training data & Test Data**"""

X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, stratify=Y, random_state=2)

print(X.shape, X_train.shape, X_test.shape)

"""Model Training

Logistic Regression
"""

model = LogisticRegression()

# training the LogisticRegression model with Training data
model.fit(X_train, Y_train)

import pickle

# Save the scaler object to a file
with open('scaler.sav', 'wb') as scaler_file:
    pickle.dump(scaler, scaler_file)

print("Scaler has been saved to scaler.sav")

"""*Model* Evaluation

Accuracy Score
"""

# accuracy on training data
X_train_prediction = model.predict(X_train)
training_data_accuracy = accuracy_score(X_train_prediction, Y_train)

print('Accuracy on Training data : ', training_data_accuracy)

# accuracy on test data
X_test_prediction = model.predict(X_test)
test_data_accuracy = accuracy_score(X_test_prediction, Y_test)

print('Accuracy on Test data : ', test_data_accuracy)

"""### **Building a Predictive System**"""

input_data = (57,	0	,0	,120	,354	,0	,1	,163	,1	,0.6	,2	,0	,2)

# change the input data to a numpy array
input_data_as_numpy_array= np.asarray(input_data)
print(input_data_as_numpy_array.dtype)

# reshape the numpy array as we are predicting for only on instance
input_data_reshaped = input_data_as_numpy_array.reshape(1,-1)
print(input_data_reshaped.dtype)

prediction = model.predict(input_data_reshaped)
print(prediction)

if (prediction[0]== 0):
  print('The Person does not have a Heart Disease')
else:
  print('The Person has Heart Disease')

"""### **Saving the trained model**"""

import pickle

filename = 'heart_disease_model.sav'
pickle.dump(model, open(filename, 'wb'))

# loading the saved model
loaded_model = pickle.load(open('heart_disease_model.sav', 'rb'))

# Accessing the column names from the original heart_data DataFrame
for column in heart_data.drop(columns='target').columns:
  print(column)

print(sklearn.__version__)
