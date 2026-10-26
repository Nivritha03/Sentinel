import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split


def generate_synthetic_transactions(n_samples: int = 10000, random_state: int = 42):
    """
    Generate realistic synthetic transaction data for fraud detection modeling.
    Features:
      - amount: transaction amount
      - same_sender_receiver: 1 if accounts match, else 0
      - hour_of_day: 0 to 23
      - day_of_week: 0 to 6
    """
    np.random.seed(random_state)

    # Amounts: log-normal distribution for typical banking
    amounts = np.random.lognormal(mean=4.5, sigma=1.2, size=n_samples)

    # Hours: standard distribution with slight late-night activity
    hours = np.random.randint(0, 24, size=n_samples)
    days = np.random.randint(0, 7, size=n_samples)

    # Same sender/receiver: rare in clean, but strongly correlated with high fraud/loop
    same_acc = np.random.choice([0, 1], size=n_samples, p=[0.97, 0.03])

    # Probability of fraud rule
    # High amount (>5000), late night (1am-5am), or same account elevates risk
    fraud_prob = 0.02 + (
        0.35 * (amounts > 5000)
        + 0.25 * (amounts > 10000)
        + 0.40 * same_acc
        + 0.15 * ((hours >= 1) & (hours <= 5))
    )
    fraud_prob = np.clip(fraud_prob, 0.0, 0.95)

    labels = (np.random.rand(n_samples) < fraud_prob).astype(int)

    df = pd.DataFrame(
        {
            "amount": amounts,
            "same_sender_receiver": same_acc,
            "hour_of_day": hours,
            "day_of_week": days,
            "is_fraud": labels,
        }
    )
    return df


def train_and_export_model(
    output_path: str = os.path.join(
        os.path.dirname(__file__), "..", "model.joblib"
    )
):
    print("Generating training dataset...")
    df = generate_synthetic_transactions(n_samples=15000, random_state=42)

    X = df[["amount", "same_sender_receiver", "hour_of_day", "day_of_week"]]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = model.predict(X_test)
    auc = roc_auc_score(y_test, y_pred_proba)

    print(f"Model AUC-ROC: {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    joblib.dump(model, output_path)
    print(f"Model saved successfully to {os.path.abspath(output_path)}")
    return model


if __name__ == "__main__":
    train_and_export_model()
