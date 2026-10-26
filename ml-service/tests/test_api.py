import pytest
from fastapi.testclient import TestClient
from main import app, load_model

client = TestClient(app)


@pytest.fixture(autouse=True)
def init_test():
    load_model()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["service"] == "sentinel-ml-service"
    assert "modelLoaded" in data


def test_predict_low_risk_transaction():
    payload = {
        "amount": 50.0,
        "currency": "USD",
        "sameSenderReceiver": False,
        "hourOfDay": 14,
        "dayOfWeek": 2,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fraudProbability" in data
    assert "riskLevel" in data
    assert 0.0 <= data["fraudProbability"] <= 1.0
    assert data["modelAvailable"] is True


def test_predict_high_risk_transaction():
    payload = {
        "amount": 15000.0,
        "currency": "USD",
        "sameSenderReceiver": True,
        "hourOfDay": 3,
        "dayOfWeek": 5,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["fraudProbability"] > 0.35
    assert data["riskLevel"] in ["MEDIUM", "HIGH"]


def test_invalid_amount_validation():
    payload = {
        "amount": -100.0,
        "currency": "USD",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
