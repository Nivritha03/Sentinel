
package com.sentinel.investigation;

import java.time.Instant;

public class CaseNote {

    private String id;
    private String author;
    private String content;
    private Instant createdAt;

    public CaseNote() {}

    public CaseNote(String id, String author, String content) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
