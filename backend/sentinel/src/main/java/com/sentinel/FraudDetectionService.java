package com.sentinel;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sentinel.ml.MlPredictionRequest;
import com.sentinel.ml.MlPredictionResponse;
import com.sentinel.ml.MlService;

@Service
public class FraudDetectionService {

    private final MlService mlService;
    private final String scoringMode;

    public FraudDetectionService(
            MlService mlService,
            @Value("${sentinel.ml.mode:HYBRID}") String scoringMode) {
        this.mlService = mlService;
        this.scoringMode = scoringMode;
    }

    public void assess(Transaction transaction) {
        int ruleScore = calculateRuleScore(transaction);
        List<String> reasons = calculateRuleReasons(transaction);

        int finalScore = ruleScore;
        String mode = scoringMode != null ? scoringMode.trim().toUpperCase() : "HYBRID";

        if ("ML_ONLY".equals(mode) || "HYBRID".equals(mode)) {
            MlPredictionRequest req = new MlPredictionRequest();
            req.setAmount(transaction.getAmount());
            req.setCurrency(transaction.getCurrency());

            String sender = transaction.getSenderAccount();
            String receiver = transaction.getReceiverAccount();
            req.setSameSenderReceiver(sender != null && receiver != null
                    && sender.trim().equalsIgnoreCase(receiver.trim()));

            ZonedDateTime zdt = (transaction.getTimestamp() != null ? transaction.getTimestamp() : java.time.Instant.now())
                    .atZone(ZoneId.systemDefault());
            req.setHourOfDay(zdt.getHour());
            req.setDayOfWeek(zdt.getDayOfWeek().getValue() % 7);

            MlPredictionResponse mlResp = mlService.predict(req);

            if (mlResp != null && mlResp.isModelAvailable() && mlResp.getFraudProbability() >= 0) {
                int mlScore = (int) Math.round(mlResp.getFraudProbability() * 100);
                if ("ML_ONLY".equals(mode)) {
                    finalScore = mlScore;
                    reasons = new ArrayList<>();
                    reasons.add("ML Model (" + mlResp.getModelVersion() + ") probability: "
                            + Math.round(mlResp.getFraudProbability() * 100) + "%");
                } else {
                    // HYBRID: 50% Rule-based + 50% ML Model
                    finalScore = (int) Math.round((ruleScore * 0.5) + (mlScore * 0.5));
                    reasons.add("ML Model (" + mlResp.getModelVersion() + ") probability: "
                            + Math.round(mlResp.getFraudProbability() * 100) + "% [HYBRID scoring]");
                }
            } else if ("ML_ONLY".equals(mode)) {
                reasons.add("ML Service unavailable; fell back to rule-based evaluation");
            }
        }

        finalScore = Math.min(Math.max(finalScore, 0), 100);

        String level;
        if (finalScore >= 60) {
            level = "HIGH";
        } else if (finalScore >= 30) {
            level = "MEDIUM";
        } else {
            level = "LOW";
        }

        if (reasons.isEmpty()) {
            reasons.add("No configured risk rules were triggered");
        }

        transaction.setRiskScore(finalScore);
        transaction.setRiskLevel(level);
        transaction.setRiskReasons(reasons);
        transaction.setStatus(finalScore >= 60 ? "REVIEW_REQUIRED" : "ASSESSED");
    }

    private int calculateRuleScore(Transaction transaction) {
        int score = 0;
        double amount = transaction.getAmount();

        if (amount >= 10000) {
            score += 30;
        } else if (amount >= 5000) {
            score += 20;
        } else if (amount >= 1000) {
            score += 10;
        }

        String sender = transaction.getSenderAccount();
        String receiver = transaction.getReceiverAccount();

        if (sender != null && receiver != null
                && sender.trim().equalsIgnoreCase(receiver.trim())) {
            score += 50;
        }

        return Math.min(score, 100);
    }

    private List<String> calculateRuleReasons(Transaction transaction) {
        List<String> reasons = new ArrayList<>();
        double amount = transaction.getAmount();

        if (amount >= 10000) {
            reasons.add("Very high transaction amount (10000 or more)");
        } else if (amount >= 5000) {
            reasons.add("High transaction amount (5000 or more)");
        } else if (amount >= 1000) {
            reasons.add("Elevated transaction amount (1000 or more)");
        }

        String sender = transaction.getSenderAccount();
        String receiver = transaction.getReceiverAccount();

        if (sender != null && receiver != null
                && sender.trim().equalsIgnoreCase(receiver.trim())) {
            reasons.add("Sender and receiver accounts are identical");
        }

        return reasons;
    }
}
