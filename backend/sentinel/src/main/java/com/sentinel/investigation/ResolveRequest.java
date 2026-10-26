
package com.sentinel.investigation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ResolveRequest {

    @NotNull(message = "Decision is required")
    private InvestigationDecision decision;

    @NotBlank(message = "Resolution summary is required")
    @Size(max = 2000, message = "Summary must not exceed 2000 characters")
    private String resolutionSummary;

    public InvestigationDecision getDecision() { return decision; }
    public void setDecision(InvestigationDecision decision) { this.decision = decision; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }
}
