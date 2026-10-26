
package com.sentinel.investigation;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.sentinel.auth.Role;
import com.sentinel.auth.UserService;
import com.sentinel.AuditLog;
import com.sentinel.AuditLogRepository;

@Service
public class InvestigationService {

    private final InvestigationRepository investigationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserService userService;

    public InvestigationService(InvestigationRepository investigationRepository,
                                AuditLogRepository auditLogRepository,
                                UserService userService) {
        this.investigationRepository = investigationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userService = userService;
    }

    public Investigation create(CreateInvestigationRequest req, String actor) {
        ensureRole(actor, Role.ADMIN, Role.ANALYST);
        // Prevent duplicate open cases for the same transaction
        List<InvestigationStatus> activeStatuses = List.of(
                InvestigationStatus.OPEN,
                InvestigationStatus.IN_PROGRESS,
                InvestigationStatus.WAITING_FOR_INFORMATION
        );
        investigationRepository
                .findByTransactionIdAndStatusIn(req.getTransactionId(), activeStatuses)
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "An active investigation already exists for this transaction: " + existing.getId());
                });

        Investigation inv = new Investigation();
        inv.setTransactionId(req.getTransactionId());
        inv.setPriority(req.getPriority() != null ? req.getPriority() : CasePriority.MEDIUM);

        if (req.getInitialNote() != null && !req.getInitialNote().isBlank()) {
            CaseNote note = new CaseNote(UUID.randomUUID().toString(), actor, req.getInitialNote().trim());
            inv.getNotes().add(note);
        }

        inv.getHistory().add(new CaseHistoryEvent(actor, "CASE_OPENED",
                "Investigation opened with priority " + inv.getPriority()));

        Investigation saved = investigationRepository.save(inv);

        auditLogRepository.save(new AuditLog(
                saved.getTransactionId(), "INVESTIGATION_CREATED",
                "Case " + saved.getId() + " opened by " + actor));

        return saved;
    }

    public Page<Investigation> findAll(InvestigationStatus status, CasePriority priority,
                                       int page, int size) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        if (status != null && priority != null) {
            return investigationRepository.findByStatusAndPriority(status, priority, pageable);
        }
        if (status != null) {
            return investigationRepository.findByStatus(status, pageable);
        }
        if (priority != null) {
            return investigationRepository.findByPriority(priority, pageable);
        }
        return investigationRepository.findAll(pageable);
    }

    public Investigation findById(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Investigation id cannot be null");
        }
        return investigationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Investigation not found: " + id));
    }

    public Investigation update(String id, UpdateInvestigationRequest req, String actor) {
        ensureRole(actor, Role.ADMIN, Role.ANALYST);
        Investigation inv = findById(id);
        requireNotTerminal(inv);
        ensureCanModify(inv, actor);
        StringBuilder changes = new StringBuilder();
        if (req.getStatus() != null && req.getStatus() != inv.getStatus()) {
            changes.append("Status: ").append(inv.getStatus()).append(" → ").append(req.getStatus()).append(". ");
            inv.setStatus(req.getStatus());
        }
        if (req.getPriority() != null && req.getPriority() != inv.getPriority()) {
            changes.append("Priority: ").append(inv.getPriority()).append(" → ").append(req.getPriority()).append(". ");
            inv.setPriority(req.getPriority());
        }

        if (changes.length() > 0) {
            inv.getHistory().add(new CaseHistoryEvent(actor, "CASE_UPDATED", changes.toString().trim()));
            inv.setUpdatedAt(Instant.now());
        }

        return investigationRepository.save(java.util.Objects.requireNonNull(inv));
    }

    public Investigation addNote(String id, AddNoteRequest req, String actor) {
        ensureRole(actor, Role.ADMIN, Role.ANALYST);
        Investigation inv = findById(id);
        requireNotTerminal(inv);
        ensureCanModify(inv, actor);
        CaseNote note = new CaseNote(UUID.randomUUID().toString(), actor, req.getContent().trim());
        inv.getNotes().add(note);
        inv.getHistory().add(new CaseHistoryEvent(actor, "NOTE_ADDED",
                "Note added: " + truncate(req.getContent(), 80)));
        inv.setUpdatedAt(Instant.now());

        Investigation saved = investigationRepository.save(inv);

        auditLogRepository.save(new AuditLog(
                inv.getTransactionId(), "INVESTIGATION_NOTE_ADDED",
                "Note added to case " + id + " by " + actor));

        return saved;
    }

    public Investigation assign(String id, AssignRequest req, String actor) {
        ensureRole(actor, Role.ADMIN, Role.ANALYST);
        Investigation inv = findById(id);
        requireNotTerminal(inv);
        ensureCanModify(inv, actor);
        String previous = inv.getAssignedAnalyst();
        inv.setAssignedAnalyst(req.getAnalyst().trim());
        inv.getHistory().add(new CaseHistoryEvent(actor, "CASE_ASSIGNED",
                "Assigned to " + req.getAnalyst() + (previous != null ? " (was: " + previous + ")" : "")));
        inv.setUpdatedAt(Instant.now());

        Investigation saved = investigationRepository.save(inv);

        auditLogRepository.save(new AuditLog(
                inv.getTransactionId(), "INVESTIGATION_ASSIGNED",
                "Case " + id + " assigned to " + req.getAnalyst() + " by " + actor));

        return saved;
    }

    public Investigation resolve(String id, ResolveRequest req, String actor) {
        ensureRole(actor, Role.ADMIN, Role.ANALYST);
        Investigation inv = findById(id);
        ensureCanModify(inv, actor);
        if (inv.getStatus() == InvestigationStatus.RESOLVED
                || inv.getStatus() == InvestigationStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Investigation is already " + inv.getStatus());
        }

        inv.setDecision(req.getDecision());
        inv.setResolutionSummary(req.getResolutionSummary().trim());
        inv.setStatus(InvestigationStatus.RESOLVED);
        inv.setResolvedAt(Instant.now());
        inv.setUpdatedAt(Instant.now());
        inv.getHistory().add(new CaseHistoryEvent(actor, "CASE_RESOLVED",
                "Resolved as " + req.getDecision() + ": " + truncate(req.getResolutionSummary(), 80)));

        Investigation saved = investigationRepository.save(inv);

        auditLogRepository.save(new AuditLog(
                inv.getTransactionId(), "INVESTIGATION_RESOLVED",
                "Case " + id + " resolved as " + req.getDecision() + " by " + actor));

        return saved;
    }

    public List<CaseHistoryEvent> getHistory(String id) {
        return findById(id).getHistory();
    }

    // ─── Private helpers ───────────────────────────────────────────────────

    private void requireNotTerminal(Investigation inv) {
        if (inv.getStatus() == InvestigationStatus.RESOLVED
                || inv.getStatus() == InvestigationStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Cannot modify a " + inv.getStatus() + " investigation");
        }
    }

    private void ensureRole(String username, Role... allowed) {
        com.sentinel.auth.User user = (com.sentinel.auth.User) userService.loadUserByUsername(username);
        Role userRole = user.getRole();
        for (Role role : allowed) {
            if (role == userRole) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
    }

    /**
     * Ensure that the actor is allowed to modify the given investigation.
     * ADMIN can modify any investigation.
     * ANALYST can modify only investigations assigned to them.
     * VIEWER cannot modify investigations.
     */
    private void ensureCanModify(Investigation inv, String actor) {
        com.sentinel.auth.User user = (com.sentinel.auth.User) userService.loadUserByUsername(actor);
        Role role = user.getRole();
        if (role == Role.ADMIN) {
            return;
        }
        if (role == Role.ANALYST) {
            if (actor.equals(inv.getAssignedAnalyst())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Analyst can only modify investigations assigned to them");
        }
        // VIEWER or any other role cannot modify
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}
