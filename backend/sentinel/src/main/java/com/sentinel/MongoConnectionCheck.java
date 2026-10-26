
package com.sentinel;

import org.bson.Document;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class MongoConnectionCheck implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    public MongoConnectionCheck(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        mongoTemplate.executeCommand(
            new Document("ping", 1)
        );

        System.out.println(
            "SUCCESS: Connected to MongoDB Atlas!"
        );
    }
}
