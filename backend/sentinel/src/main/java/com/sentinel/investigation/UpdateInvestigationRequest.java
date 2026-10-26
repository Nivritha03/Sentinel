
package com.sentinel.investigation;

public class UpdateInvestigationRequest {

    private InvestigationStatus status;
    private CasePriority priority;

    public InvestigationStatus getStatus() { return status; }
    public void setStatus(InvestigationStatus status) { this.status = status; }

    public CasePriority getPriority() { return priority; }
    public void setPriority(CasePriority priority) { this.priority = priority; }
}
