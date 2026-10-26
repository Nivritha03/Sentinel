# Sentinel ML Service

Dedicated microservice for real-time machine-learning fraud scoring using FastAPI, scikit-learn, and Random Forest.

## Setup & Running Locally

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train Model (Reproducible pipeline):**
   ```bash
   python training/train.py
   ```
   This generates `model.joblib`.

3. **Run Automated Tests:**
   ```bash
   python -m pytest tests/
   ```

4. **Start the FastAPI Service:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Endpoints

- `GET /health`: Health status & loaded model info.
- `POST /predict`: Fraud probability scoring (0.0 to 1.0) and risk level classification.
