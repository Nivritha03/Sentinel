
package com.sentinel;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TransactionRepository
        extends MongoRepository<Transaction, String> {

    List<Transaction> findByRiskScoreGreaterThanEqual(int riskScore);
}
