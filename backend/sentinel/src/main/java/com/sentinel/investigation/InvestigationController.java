
package com.sentinel.investigation;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/investigations")
public class InvestigationController {

    private final InvestigationService investigationService;

    public InvestigationController(InvestigationService investigationService) {
        this.investigationService = investigationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public InvestigationResponse create(
            @Validated @RequestBody CreateInvestigationRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return InvestigationResponse.from(
                investigationService.create(req, user.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public Page<InvestigationResponse> list(
            @RequestParam(required = false) InvestigationStatus status,
            @RequestParam(required = false) CasePriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return investigationService.findAll(status, priority, page, size)
                .map(InvestigationResponse::from);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public InvestigationResponse getById(@PathVariable String id) {
        return InvestigationResponse.from(investigationService.findById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public InvestigationResponse update(
            @PathVariable String id,
            @RequestBody UpdateInvestigationRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return InvestigationResponse.from(
                investigationService.update(id, req, user.getUsername()));
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public InvestigationResponse addNote(
            @PathVariable String id,
            @Validated @RequestBody AddNoteRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return InvestigationResponse.from(
                investigationService.addNote(id, req, user.getUsername()));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public InvestigationResponse assign(
            @PathVariable String id,
            @Validated @RequestBody AssignRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return InvestigationResponse.from(
                investigationService.assign(id, req, user.getUsername()));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    public InvestigationResponse resolve(
            @PathVariable String id,
            @Validated @RequestBody ResolveRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return InvestigationResponse.from(
                investigationService.resolve(id, req, user.getUsername()));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
    public ResponseEntity<List<CaseHistoryEvent>> getHistory(@PathVariable String id) {
        return ResponseEntity.ok(investigationService.getHistory(id));
    }
}
