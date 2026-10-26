
package com.sentinel;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    private String transactionId;
    private String action;
    private String details;
    private Instant timestamp;

    public AuditLog() {
    }

    public AuditLog(String transactionId, String action, String details) {
        this.transactionId = transactionId;
        this.action = action;
        this.details = details;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public String getAction() { return action; }
    public String getDetails() { return details; }
    public Instant getTimestamp() { return timestamp; }
}
