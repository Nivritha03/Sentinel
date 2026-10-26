
package com.sentinel.ml;

public class MlPredictionResponse {

    private double fraudProbability;
    private String riskLevel;
    private String modelVersion;
    private String predictionTimestamp;
    private boolean modelAvailable = true;

    public double getFraudProbability() { return fraudProbability; }
    public void setFraudProbability(double fraudProbability) { this.fraudProbability = fraudProbability; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getPredictionTimestamp() { return predictionTimestamp; }
    public void setPredictionTimestamp(String predictionTimestamp) { this.predictionTimestamp = predictionTimestamp; }

    public boolean isModelAvailable() { return modelAvailable; }
    public void setModelAvailable(boolean modelAvailable) { this.modelAvailable = modelAvailable; }
}
