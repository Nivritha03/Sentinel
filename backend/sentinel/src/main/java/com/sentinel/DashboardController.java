
package com.sentinel;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final TransactionService transactionService;

    public DashboardController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        List<Transaction> transactions =
                transactionService.getAllTransactions();

        long total = transactions.size();
        long highRisk = transactions.stream()
                .filter(t -> t.getRiskScore() >= 60)
                .count();
        long mediumRisk = transactions.stream()
                .filter(t -> t.getRiskScore() >= 30
                        && t.getRiskScore() < 60)
                .count();
        long lowRisk = transactions.stream()
                .filter(t -> t.getRiskScore() < 30)
                .count();
        long confirmedFraud = transactions.stream()
                .filter(t -> "CONFIRMED_FRAUD".equals(t.getStatus()))
                .count();
        long pendingReview = transactions.stream()
                .filter(t -> "REVIEW_REQUIRED".equals(t.getStatus()))
                .count();

        double averageRisk = transactions.stream()
                .mapToInt(t -> t.getRiskScore())
                .average()
                .orElse(0.0);

        Map<String, Object> result = new HashMap<>();
        result.put("totalTransactions", total);
        result.put("highRiskTransactions", highRisk);
        result.put("mediumRiskTransactions", mediumRisk);
        result.put("lowRiskTransactions", lowRisk);
        result.put("confirmedFraudTransactions", confirmedFraud);
        result.put("pendingReviewTransactions", pendingReview);
        result.put("averageRiskScore", Math.round(averageRisk * 100.0) / 100.0);

        return result;
    }
}
