
package com.sentinel.investigation;

import java.time.Instant;
import java.util.List;

public class InvestigationResponse {

    private String id;
    private String transactionId;
    private String assignedAnalyst;
    private InvestigationStatus status;
    private CasePriority priority;
    private List<CaseNote> notes;
    private List<String> evidenceReferences;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
    private InvestigationDecision decision;
    private String resolutionSummary;

    public static InvestigationResponse from(Investigation inv) {
        InvestigationResponse r = new InvestigationResponse();
        r.id = inv.getId();
        r.transactionId = inv.getTransactionId();
        r.assignedAnalyst = inv.getAssignedAnalyst();
        r.status = inv.getStatus();
        r.priority = inv.getPriority();
        r.notes = inv.getNotes();
        r.evidenceReferences = inv.getEvidenceReferences();
        r.createdAt = inv.getCreatedAt();
        r.updatedAt = inv.getUpdatedAt();
        r.resolvedAt = inv.getResolvedAt();
        r.decision = inv.getDecision();
        r.resolutionSummary = inv.getResolutionSummary();
        return r;
    }

    public String getId() { return id; }
    public String getTransactionId() { return transactionId; }
    public String getAssignedAnalyst() { return assignedAnalyst; }
    public InvestigationStatus getStatus() { return status; }
    public CasePriority getPriority() { return priority; }
    public List<CaseNote> getNotes() { return notes; }
    public List<String> getEvidenceReferences() { return evidenceReferences; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public InvestigationDecision getDecision() { return decision; }
    public String getResolutionSummary() { return resolutionSummary; }
}
