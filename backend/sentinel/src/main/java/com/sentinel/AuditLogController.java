
package com.sentinel;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AuditLog> getAll() {
        return auditLogService.getAllLogs();
    }

    @GetMapping("/transaction/{transactionId}")
    public List<AuditLog> getByTransaction(
            @PathVariable String transactionId) {
        return auditLogService.getLogsForTransaction(transactionId);
    }
}
