
package com.sentinel.investigation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddNoteRequest {

    @NotBlank(message = "Note content is required")
    @Size(max = 2000, message = "Note must not exceed 2000 characters")
    private String content;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
