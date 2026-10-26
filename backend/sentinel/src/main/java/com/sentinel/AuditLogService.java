
package com.sentinel;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getLogsForTransaction(String transactionId) {
        return auditLogRepository
                .findByTransactionIdOrderByTimestampDesc(transactionId);
    }
}
