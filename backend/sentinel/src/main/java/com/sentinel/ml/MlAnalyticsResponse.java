
package com.sentinel.ml;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class MlAnalyticsResponse {

    private String mode;
    private double latestFraudProbability;
    private List<TrendPoint> trend = new ArrayList<>();

    public static class TrendPoint {
        private Instant timestamp;
        private double probability;
        public TrendPoint() {}
        public TrendPoint(Instant timestamp, double probability) {
            this.timestamp = timestamp;
            this.probability = probability;
        }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public double getProbability() { return probability; }
        public void setProbability(double probability) { this.probability = probability; }
    }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public double getLatestFraudProbability() { return latestFraudProbability; }
    public void setLatestFraudProbability(double latestFraudProbability) { this.latestFraudProbability = latestFraudProbability; }
    public List<TrendPoint> getTrend() { return trend; }
    public void setTrend(List<TrendPoint> trend) { this.trend = trend; }
}
