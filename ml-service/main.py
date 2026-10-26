import datetime
import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field

app = FastAPI(
    title="Sentinel ML Service",
    description="Dedicated machine-learning fraud detection microservice for Sentinel",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
MODEL = None
MODEL_VERSION = "rf-v1.0.0"


def load_model():
    global MODEL
    if os.path.exists(MODEL_PATH):
        try:
            MODEL = joblib.load(MODEL_PATH)
            print(f"Loaded trained model from {MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load model: {e}")
            MODEL = None
    else:
        print(f"Model file not found at {MODEL_PATH}. Prediction fallback active.")


@app.on_event("startup")
def startup_event():
    load_model()


class PredictionRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: Optional[str] = Field("USD", description="Currency code")
    sameSenderReceiver: bool = Field(False, description="Sender and receiver are identical")
    hourOfDay: int = Field(12, ge=0, le=23, description="Hour of the day (0-23)")
    dayOfWeek: int = Field(0, ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")


class PredictionResponse(BaseModel):
    fraudProbability: float
    riskLevel: str
    modelVersion: str
    predictionTimestamp: str
    modelAvailable: bool = True


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "sentinel-ml-service",
        "modelLoaded": MODEL is not None,
        "modelVersion": MODEL_VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_fraud(req: PredictionRequest):
    timestamp_str = datetime.datetime.utcnow().isoformat() + "Z"

    if MODEL is None:
        # Fallback heuristic if model is not yet loaded
        same_acc = 1 if req.sameSenderReceiver else 0
        prob = min(0.95, (req.amount / 15000.0) * 0.4 + (0.5 if same_acc else 0.05))
        level = "HIGH" if prob >= 0.6 else ("MEDIUM" if prob >= 0.3 else "LOW")
        return PredictionResponse(
            fraudProbability=round(prob, 4),
            riskLevel=level,
            modelVersion=MODEL_VERSION + "-heuristic",
            predictionTimestamp=timestamp_str,
            modelAvailable=False,
        )

    try:
        # Input features matching training order
        features = pd.DataFrame(
            [
                {
                    "amount": req.amount,
                    "same_sender_receiver": 1 if req.sameSenderReceiver else 0,
                    "hour_of_day": req.hourOfDay,
                    "day_of_week": req.dayOfWeek,
                }
            ]
        )

        proba = float(MODEL.predict_proba(features)[0][1])

        if proba >= 0.60:
            risk_level = "HIGH"
        elif proba >= 0.30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return PredictionResponse(
            fraudProbability=round(proba, 4),
            riskLevel=risk_level,
            modelVersion=MODEL_VERSION,
            predictionTimestamp=timestamp_str,
            modelAvailable=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
