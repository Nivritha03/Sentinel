
package com.sentinel;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final AuditLogRepository auditLogRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            FraudDetectionService fraudDetectionService,
            AuditLogRepository auditLogRepository) {
        this.transactionRepository = transactionRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.auditLogRepository = auditLogRepository;
    }

    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getAmount() <= 0
                || !Double.isFinite(transaction.getAmount())) {
            throw new IllegalArgumentException(
                    "Amount must be a finite number greater than zero");
        }

        requireText(transaction.getSenderAccount(), "Sender account");
        requireText(transaction.getReceiverAccount(), "Receiver account");
        requireText(transaction.getCurrency(), "Currency");

        transaction.setTimestamp(Instant.now());

        fraudDetectionService.assess(transaction);

        Transaction saved = transactionRepository.save(transaction);

        auditLogRepository.save(new AuditLog(
                saved.getId(),
                "TRANSACTION_CREATED",
                "Initial risk assessment: " + saved.getRiskLevel()
                        + ", score: " + saved.getRiskScore()));

        return saved;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
        }
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public List<Transaction> getFlaggedTransactions() {
        return transactionRepository.findByRiskScoreGreaterThanEqual(60);
    }

    public long getTransactionCount() {
        return transactionRepository.count();
    }

    public Transaction reviewTransaction(String id, String decision) {
        if (decision == null) {
            throw new IllegalArgumentException("Decision is required");
        }

        String normalized = decision.trim().toUpperCase();

        if (!List.of("REVIEWED", "CONFIRMED_FRAUD", "FALSE_POSITIVE")
                .contains(normalized)) {
            throw new IllegalArgumentException(
                    "Decision must be REVIEWED, CONFIRMED_FRAUD, "
                    + "or FALSE_POSITIVE");
        }

        Transaction transaction = getTransactionById(id);
        transaction.setStatus(normalized);

        Transaction saved = transactionRepository.save(transaction);

        auditLogRepository.save(new AuditLog(
                saved.getId(),
                "INVESTIGATION_DECISION",
                "Investigation status changed to " + normalized));

        return saved;
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
