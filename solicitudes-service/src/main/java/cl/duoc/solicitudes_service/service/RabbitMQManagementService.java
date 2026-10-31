package cl.duoc.solicitudes_service.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class RabbitMQManagementService {

    private final RestClient restClient;
    private final String managementApiUrl;

    public RabbitMQManagementService(
            @Value("${app.rabbitmq.management.api-url}") String managementApiUrl,
            @Value("${app.rabbitmq.management.username}") String username,
            @Value("${app.rabbitmq.management.password}") String password) {

        this.managementApiUrl = managementApiUrl;

        this.restClient = RestClient.builder()
                .defaultHeaders(headers ->
                        headers.setBasicAuth(username, password))
                .build();
    }

    public List<Map<String, Object>> listarColas() {
        return consultar("/api/queues/%2F");
    }

    public List<Map<String, Object>> listarExchanges() {
        return consultar("/api/exchanges/%2F");
    }

    public List<Map<String, Object>> listarBindings() {
        return consultar("/api/bindings/%2F");
    }

    private List<Map<String, Object>> consultar(String endpoint) {

        return restClient.get()
                .uri(URI.create(managementApiUrl + endpoint))
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<Map<String, Object>>>() {});
    }
}
