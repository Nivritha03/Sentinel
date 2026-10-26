
package com.sentinel.investigation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InvestigationRepository extends MongoRepository<Investigation, String> {

    Optional<Investigation> findByTransactionIdAndStatusIn(
            String transactionId, List<InvestigationStatus> statuses);

    Page<Investigation> findByStatus(InvestigationStatus status, Pageable pageable);

    Page<Investigation> findByPriority(CasePriority priority, Pageable pageable);

    Page<Investigation> findByStatusAndPriority(
            InvestigationStatus status, CasePriority priority, Pageable pageable);

    List<Investigation> findByTransactionId(String transactionId);
}
