
package com.sentinel.investigation;

import java.time.Instant;

public class CaseHistoryEvent {

    private String actor;
    private String action;
    private String details;
    private Instant occurredAt;

    public CaseHistoryEvent() {}

    public CaseHistoryEvent(String actor, String action, String details) {
        this.actor = actor;
        this.action = action;
        this.details = details;
        this.occurredAt = Instant.now();
    }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }
}
