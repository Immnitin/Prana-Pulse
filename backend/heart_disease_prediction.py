import pandas as pd
import numpy as np
import pickle
import shap
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, 
    roc_auc_score, 
    brier_score_loss,
    average_precision_score,
    confusion_matrix
)
from sklearn.calibration import calibration_curve

print("--- Comprehensive Model Training & Evaluation Pipeline ---")

# --- 1. Data Loading ---
try:
    # --- IMPORTANT: Change this to 'diabetes_prediction_dataset.csv' for the diabetes model ---
    data = pd.read_csv('heart_disease_data.csv')
    print("Dataset loaded successfully.")
except FileNotFoundError:
    print("Error: Dataset CSV file not found.")
    exit()

# --- 2. Feature and Target Separation ---
# --- IMPORTANT: Change 'target' to 'diabetes' for the diabetes model ---
X_features = data.drop(columns='target', axis=1)
Y_target = data['target']

# --- 3. Train-Test Split ---
X_train_df, X_test_df, Y_train, Y_test = train_test_split(
    X_features, Y_target, test_size=0.2, stratify=Y_target, random_state=42
)

# --- 4. Data Standardization ---
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_df)
X_test_scaled = scaler.transform(X_test_df)
print("Data has been standardized.")

# --- 5. Model Training ---
model = LogisticRegression(solver='liblinear')
model.fit(X_train_scaled, Y_train)
print("Model training complete.")

# --- 6. Comprehensive Model Evaluation ---
print("\n--- Model Performance Metrics ---")
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

# --- Discrimination Metrics ---
print("\n--- Discrimination ---")
auroc = roc_auc_score(Y_test, y_pred_proba)
auprc = average_precision_score(Y_test, y_pred_proba)
print(f"AUROC Score: {auroc:.4f}")
print(f"AUPRC Score: {auprc:.4f}")

# --- Calibration Metrics ---
print("\n--- Calibration ---")
brier_score = brier_score_loss(Y_test, y_pred_proba)
print(f"Brier Score Loss: {brier_score:.4f} (Lower is better)")

# Expected Calibration Error (ECE)
def expected_calibration_error(y_true, y_prob, n_bins=10):
    bin_limits = np.linspace(0, 1, n_bins + 1)
    bin_lowers = bin_limits[:-1]
    bin_uppers = bin_limits[1:]
    ece = 0
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (y_prob > bin_lower) & (y_prob <= bin_upper)
        if np.sum(in_bin) > 0:
            prob_in_bin = y_prob[in_bin]
            true_in_bin = y_true[in_bin]
            avg_confidence_in_bin = np.mean(prob_in_bin)
            avg_accuracy_in_bin = np.mean(true_in_bin)
            ece += np.abs(avg_confidence_in_bin - avg_accuracy_in_bin) * (np.sum(in_bin) / len(y_true))
    return ece

ece = expected_calibration_error(Y_test.values, y_pred_proba)
print(f"Expected Calibration Error (ECE): {ece:.4f} (Lower is better)")

# Calibration Plot
prob_true, prob_pred = calibration_curve(Y_test, y_pred_proba, n_bins=10)
plt.figure(figsize=(8, 8))
plt.plot([0, 1], [0, 1], linestyle='--', label='Perfectly Calibrated')
plt.plot(prob_pred, prob_true, marker='o', label='Logistic Regression')
plt.title('Calibration Plot')
plt.xlabel('Mean Predicted Probability')
plt.ylabel('Fraction of Positives')
plt.legend()
plt.savefig('calibration_plot.png')
plt.close()
print("Calibration plot saved as 'calibration_plot.png'")

# --- Fairness Metrics (for 'sex' feature) ---
print("\n--- Fairness Analysis (by Sex) ---")
# --- IMPORTANT: Change 'sex' to a relevant feature for the diabetes model if needed ---
male_indices = X_test_df[X_test_df['sex'] == 1].index
female_indices = X_test_df[X_test_df['sex'] == 0].index

def calculate_rates(y_true, y_pred):
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    tpr = tp / (tp + fn) if (tp + fn) > 0 else 0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    return tpr, fpr

tpr_male, fpr_male = calculate_rates(Y_test.loc[male_indices], y_pred[X_test_df.index.isin(male_indices)])
tpr_female, fpr_female = calculate_rates(Y_test.loc[female_indices], y_pred[X_test_df.index.isin(female_indices)])

male_positive_rate = y_pred[X_test_df.index.isin(male_indices)].mean()
female_positive_rate = y_pred[X_test_df.index.isin(female_indices)].mean()
demographic_parity_diff = abs(male_positive_rate - female_positive_rate)
print(f"Demographic Parity Difference: {demographic_parity_diff:.4f}")

tpr_diff = abs(tpr_male - tpr_female)
fpr_diff = abs(fpr_male - fpr_female)
print(f"Equalized Odds (TPR Difference): {tpr_diff:.4f}")
print(f"Equalized Odds (FPR Difference): {fpr_diff:.4f}")

# --- Explainability (SHAP) ---
print("\n--- Explainability Analysis ---")
explainer = shap.LinearExplainer(model, X_train_scaled)
shap_values = explainer.shap_values(X_test_scaled)
plt.figure()
shap.summary_plot(shap_values, X_test_df, show=False)
plt.savefig('shap_summary_plot.png', bbox_inches='tight')
plt.close()
print("SHAP summary plot saved as 'shap_summary_plot.png'")

# --- 8. Save Artifacts ---
print("\n--- Saving Final Artifacts ---")
with open('heart_disease_model.sav', 'wb') as model_file:
    pickle.dump(model, model_file)
print("Model saved successfully.")
with open('scaler.sav', 'wb') as scaler_file:
    pickle.dump(scaler, scaler_file)
print("Scaler saved successfully.")

