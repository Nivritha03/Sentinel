
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import traceback

app = FastAPI()

MODEL_PATH = os.getenv("ML_MODEL_PATH", "model.pkl")

class PredictRequest(BaseModel):
    transaction_id: str
    amount: float
    sender_country: str
    receiver_country: str
    # add other features as needed

class PredictResponse(BaseModel):
    fraud_probability: float
    risk_level: str
    model_version: str

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    return joblib.load(MODEL_PATH)

model = None
model_version = "unknown"

@app.on_event("startup")
async def startup_event():
    global model, model_version
    try:
        model = load_model()
        model_version = getattr(model, "__version__", "v1")
    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"Failed to load ML model: {e}")

@app.get("/health")
async def health_check():
    return {"status": "UP", "model_version": model_version}

@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    # Simple example: assume model expects a list of features
    features = [req.amount, len(req.sender_country), len(req.receiver_country)]
    prob = model.predict_proba([features])[0][1]
    risk = "HIGH" if prob >= 0.6 else "MEDIUM" if prob >= 0.3 else "LOW"
    return PredictResponse(
        fraud_probability=prob,
        risk_level=risk,
        model_version=model_version,
    )
