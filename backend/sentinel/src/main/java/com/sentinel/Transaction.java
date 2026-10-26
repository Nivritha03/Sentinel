
package com.sentinel;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    private String senderAccount;
    private String receiverAccount;
    private double amount;
    private String currency;
    private String location;
    private Instant timestamp;

    private int riskScore;
    private String riskLevel = "NOT_ASSESSED";
    private List<String> riskReasons = new ArrayList<>();
    private String status = "NEW";

    public Transaction() {
    }

    public Transaction(String senderAccount, String receiverAccount,
                       double amount, String currency, String location) {
        this.senderAccount = senderAccount;
        this.receiverAccount = receiverAccount;
        this.amount = amount;
        this.currency = currency;
        this.location = location;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderAccount() { return senderAccount; }
    public void setSenderAccount(String value) { this.senderAccount = value; }

    public String getReceiverAccount() { return receiverAccount; }
    public void setReceiverAccount(String value) { this.receiverAccount = value; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getRiskReasons() { return riskReasons; }
    public void setRiskReasons(List<String> riskReasons) {
        this.riskReasons = riskReasons;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
