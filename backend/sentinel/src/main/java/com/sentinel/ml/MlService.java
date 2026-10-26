
package com.sentinel.ml;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
public class MlService {

    private static final Logger log = LoggerFactory.getLogger(MlService.class);

    private final RestTemplate restTemplate;
    private final String mlBaseUrl;

    public MlService(RestTemplate restTemplate,
                     @Value("${sentinel.ml.base-url:http://localhost:8000}") String mlBaseUrl) {
        this.restTemplate = restTemplate;
        this.mlBaseUrl = mlBaseUrl;
    }

    public MlPredictionResponse predict(MlPredictionRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<MlPredictionRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<MlPredictionResponse> response = restTemplate.postForEntity(
                    mlBaseUrl + "/predict", entity, MlPredictionResponse.class);

            return response.getBody();
        } catch (ResourceAccessException e) {
            log.warn("ML service unreachable at {}: {}", mlBaseUrl, e.getMessage());
            return unavailableResponse();
        } catch (Exception e) {
            log.error("ML prediction failed: {}", e.getMessage());
            return unavailableResponse();
        }
    }

    public boolean isHealthy() {
        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.getForEntity(
                    mlBaseUrl + "/health", Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    private MlPredictionResponse unavailableResponse() {
        MlPredictionResponse r = new MlPredictionResponse();
        r.setModelAvailable(false);
        r.setFraudProbability(-1);
        r.setRiskLevel("UNAVAILABLE");
        r.setModelVersion("N/A");
        return r;
    }
}
