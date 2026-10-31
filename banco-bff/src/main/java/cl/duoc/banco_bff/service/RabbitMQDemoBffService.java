
package cl.duoc.banco_bff.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class RabbitMQDemoBffService {

    private final RestClient restClient;

    @Value("${solicitudes-service.url}")
    private String solicitudesServiceUrl;

    public RabbitMQDemoBffService(RestClient restClient) {
        this.restClient = restClient;
    }

    // ==========================================
    // DEMOSTRACIÓN DE MENSAJERÍA
    // ==========================================

    public Map<?, ?> enviarMensaje(String contenido) {
        return restClient.post()
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/demo/send")
                .body(Map.of("contenido", contenido))
                .retrieve()
                .body(Map.class);
    }

    public Map<?, ?> consultarEstado(String id) {
        return restClient.get()
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/demo/status/" + id)
                .retrieve()
                .body(Map.class);
    }

    // ==========================================
    // CONSULTAS DE ADMINISTRACIÓN RABBITMQ
    // ==========================================

    public List<Map<String, Object>> listarColas() {
        return consultarLista("/api/admin/rabbitmq/queues");
    }

    public List<Map<String, Object>> listarExchanges() {
        return consultarLista("/api/admin/rabbitmq/exchanges");
    }

    public List<Map<String, Object>> listarBindings() {
        return consultarLista("/api/admin/rabbitmq/bindings");
    }

    private List<Map<String, Object>> consultarLista(String endpoint) {
        return restClient.get()
                .uri(solicitudesServiceUrl + endpoint)
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<Map<String, Object>>>() {});
    }

    // ==========================================
    // ADMINISTRACIÓN DE COLAS
    // ==========================================

    public String crearCola(String nombre) {
        return restClient.post()
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/queues")
                .body(Map.of("nombre", nombre))
                .retrieve()
                .body(String.class);
    }

    public String eliminarCola(String nombre) {
        return restClient.delete()
                .uri(
                        solicitudesServiceUrl + "/api/admin/rabbitmq/queues?nombre={nombre}",
                        nombre
                )
                .retrieve()
                .body(String.class);
    }

    // ==========================================
    // ADMINISTRACIÓN DE EXCHANGES
    // ==========================================

    public String crearExchange(String nombre, String tipo) {
        return restClient.post()
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/exchanges")
                .body(Map.of(
                        "nombre", nombre,
                        "tipo", tipo
                ))
                .retrieve()
                .body(String.class);
    }

    public String eliminarExchange(String nombre) {
        return restClient.delete()
                .uri(
                        solicitudesServiceUrl + "/api/admin/rabbitmq/exchanges?nombre={nombre}",
                        nombre
                )
                .retrieve()
                .body(String.class);
    }

    // ==========================================
    // ADMINISTRACIÓN DE BINDINGS
    // ==========================================

    public String crearBinding(
            String nombreCola,
            String nombreExchange,
            String routingKey
    ) {
        return restClient.post()
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/bindings")
                .body(Map.of(
                        "nombreCola", nombreCola,
                        "nombreExchange", nombreExchange,
                        "routingKey", routingKey
                ))
                .retrieve()
                .body(String.class);
    }

    public String eliminarBinding(
            String nombreCola,
            String nombreExchange,
            String routingKey
    ) {
        return restClient.method(HttpMethod.DELETE)
                .uri(solicitudesServiceUrl + "/api/admin/rabbitmq/bindings")
                .body(Map.of(
                        "nombreCola", nombreCola,
                        "nombreExchange", nombreExchange,
                        "routingKey", routingKey
                ))
                .retrieve()
                .body(String.class);
    }
}
