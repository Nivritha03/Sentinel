
package com.sentinel.investigation;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "investigations")
public class Investigation {

    @Id
    private String id;

    @Indexed
    private String transactionId;

    private String assignedAnalyst;
    private InvestigationStatus status = InvestigationStatus.OPEN;
    private CasePriority priority = CasePriority.MEDIUM;

    private List<CaseNote> notes = new ArrayList<>();
    private List<String> evidenceReferences = new ArrayList<>();
    private List<CaseHistoryEvent> history = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;

    private InvestigationDecision decision;
    private String resolutionSummary;

    public Investigation() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    // ─── Getters & Setters ──────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getAssignedAnalyst() { return assignedAnalyst; }
    public void setAssignedAnalyst(String assignedAnalyst) { this.assignedAnalyst = assignedAnalyst; }

    public InvestigationStatus getStatus() { return status; }
    public void setStatus(InvestigationStatus status) { this.status = status; }

    public CasePriority getPriority() { return priority; }
    public void setPriority(CasePriority priority) { this.priority = priority; }

    public List<CaseNote> getNotes() { return notes; }
    public void setNotes(List<CaseNote> notes) { this.notes = notes; }

    public List<String> getEvidenceReferences() { return evidenceReferences; }
    public void setEvidenceReferences(List<String> evidenceReferences) { this.evidenceReferences = evidenceReferences; }

    public List<CaseHistoryEvent> getHistory() { return history; }
    public void setHistory(List<CaseHistoryEvent> history) { this.history = history; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public InvestigationDecision getDecision() { return decision; }
    public void setDecision(InvestigationDecision decision) { this.decision = decision; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }
}
