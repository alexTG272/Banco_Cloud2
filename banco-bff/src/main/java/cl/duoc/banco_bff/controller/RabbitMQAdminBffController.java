
package cl.duoc.banco_bff.controller;

import cl.duoc.banco_bff.service.RabbitMQDemoBffService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api/admin/rabbitmq")
public class RabbitMQAdminBffController {

    private final RabbitMQDemoBffService rabbitMQService;

    public RabbitMQAdminBffController(RabbitMQDemoBffService rabbitMQService) {
        this.rabbitMQService = rabbitMQService;
    }

    // ==========================================
    // CONSULTAS
    // ==========================================

    @GetMapping("/queues")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<?> listarColas() {
        return ResponseEntity.ok(rabbitMQService.listarColas());
    }

    @GetMapping("/exchanges")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<?> listarExchanges() {
        return ResponseEntity.ok(rabbitMQService.listarExchanges());
    }

    @GetMapping("/bindings")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<?> listarBindings() {
        return ResponseEntity.ok(rabbitMQService.listarBindings());
    }

    // ==========================================
    // COLAS
    // ==========================================

    @PostMapping("/queues")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> crearCola(@RequestBody QueueRequest request) {

        if (request == null || request.nombre() == null
                || request.nombre().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("El nombre de la cola es obligatorio");
        }

        String respuesta = rabbitMQService.crearCola(request.nombre());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @DeleteMapping("/queues")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> eliminarCola(@RequestParam String nombre) {

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("El nombre de la cola es obligatorio");
        }

        return ResponseEntity.ok(rabbitMQService.eliminarCola(nombre));
    }

    // ==========================================
    // EXCHANGES
    // ==========================================

    @PostMapping("/exchanges")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> crearExchange(@RequestBody ExchangeRequest request) {

        if (request == null
                || request.nombre() == null || request.nombre().isBlank()
                || request.tipo() == null || request.tipo().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("El nombre y el tipo de exchange son obligatorios");
        }

        String respuesta = rabbitMQService.crearExchange(
                request.nombre(),
                request.tipo()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @DeleteMapping("/exchanges")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> eliminarExchange(@RequestParam String nombre) {

        if (nombre == null || nombre.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("El nombre del exchange es obligatorio");
        }

        return ResponseEntity.ok(rabbitMQService.eliminarExchange(nombre));
    }

    // ==========================================
    // BINDINGS
    // ==========================================

    @PostMapping("/bindings")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> crearBinding(@RequestBody BindingRequest request) {

        if (!bindingValido(request)) {
            return ResponseEntity.badRequest()
                    .body("La cola, el exchange y el routing key son obligatorios");
        }

        String respuesta = rabbitMQService.crearBinding(
                request.nombreCola(),
                request.nombreExchange(),
                request.routingKey()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @DeleteMapping("/bindings")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<String> eliminarBinding(@RequestBody BindingRequest request) {

        if (!bindingValido(request)) {
            return ResponseEntity.badRequest()
                    .body("La cola, el exchange y el routing key son obligatorios");
        }

        return ResponseEntity.ok(
                rabbitMQService.eliminarBinding(
                        request.nombreCola(),
                        request.nombreExchange(),
                        request.routingKey()
                )
        );
    }

    private boolean bindingValido(BindingRequest request) {
        return request != null
                && request.nombreCola() != null && !request.nombreCola().isBlank()
                && request.nombreExchange() != null && !request.nombreExchange().isBlank()
                && request.routingKey() != null && !request.routingKey().isBlank();
    }

    // ==========================================
    // MANEJO DE ERRORES DEL MICROSERVICIO
    // ==========================================

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<String> manejarErrorMicroservicio(
            RestClientResponseException exception) {

        return ResponseEntity
                .status(exception.getStatusCode())
                .body(exception.getResponseBodyAsString());
    }

    // ==========================================
    // DTOs
    // ==========================================

    public record QueueRequest(String nombre) {}

    public record ExchangeRequest(String nombre, String tipo) {}

    public record BindingRequest(
            String nombreCola,
            String nombreExchange,
            String routingKey
    ) {}
}
