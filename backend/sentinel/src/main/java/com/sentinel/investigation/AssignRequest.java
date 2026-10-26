
package com.sentinel.investigation;

import jakarta.validation.constraints.NotBlank;

public class AssignRequest {

    @NotBlank(message = "Analyst username is required")
    private String analyst;

    public String getAnalyst() { return analyst; }
    public void setAnalyst(String analyst) { this.analyst = analyst; }
}
