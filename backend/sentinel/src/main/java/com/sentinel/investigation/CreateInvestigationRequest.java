
package com.sentinel.investigation;

import jakarta.validation.constraints.NotBlank;

public class CreateInvestigationRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    private CasePriority priority = CasePriority.MEDIUM;

    private String initialNote;

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public CasePriority getPriority() { return priority; }
    public void setPriority(CasePriority priority) { this.priority = priority; }

    public String getInitialNote() { return initialNote; }
    public void setInitialNote(String initialNote) { this.initialNote = initialNote; }
}
