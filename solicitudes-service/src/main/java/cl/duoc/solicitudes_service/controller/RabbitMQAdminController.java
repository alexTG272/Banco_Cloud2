
package cl.duoc.solicitudes_service.controller;

import cl.duoc.solicitudes_service.service.RabbitMQAdminService;
import cl.duoc.solicitudes_service.service.RabbitMQManagementService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;

@RestController
@RequestMapping("/api/admin/rabbitmq")
public class RabbitMQAdminController {

    private final RabbitMQAdminService adminService;
    private final RabbitMQManagementService managementService;

    public RabbitMQAdminController(
            RabbitMQAdminService adminService,
            RabbitMQManagementService managementService) {

        this.adminService = adminService;
        this.managementService = managementService;
    }

    // ==========================================
    // CONSULTAS: COLAS, EXCHANGES Y BINDINGS
    // ==========================================

    @GetMapping("/queues")
    public ResponseEntity<List<Map<String, Object>>> listarColas() {
        return ResponseEntity.ok(managementService.listarColas());
    }

    @GetMapping("/exchanges")
    public ResponseEntity<List<Map<String, Object>>> listarExchanges() {
        return ResponseEntity.ok(managementService.listarExchanges());
    }

    @GetMapping("/bindings")
    public ResponseEntity<List<Map<String, Object>>> listarBindings() {
        return ResponseEntity.ok(managementService.listarBindings());
    }

    // ==========================================
    // ADMINISTRACIÓN DE COLAS
    // ==========================================

    @PostMapping("/queues")
    public ResponseEntity<String> crearCola(
            @Valid @RequestBody QueueRequest request) {

        adminService.crearCola(request.nombre());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Cola creada correctamente: " + request.nombre());
    }

    @DeleteMapping("/queues")
    public ResponseEntity<String> eliminarCola(
            @RequestParam String nombre) {

        adminService.eliminarCola(nombre);

        return ResponseEntity.ok(
                "Cola eliminada correctamente: " + nombre);
    }

    // ==========================================
    // ADMINISTRACIÓN DE EXCHANGES
    // ==========================================

    @PostMapping("/exchanges")
    public ResponseEntity<String> crearExchange(
            @Valid @RequestBody ExchangeRequest request) {

        adminService.crearExchange(
                request.nombre(),
                request.tipo());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Exchange creado correctamente: " + request.nombre());
    }

    @DeleteMapping("/exchanges")
    public ResponseEntity<String> eliminarExchange(
            @RequestParam String nombre) {

        adminService.eliminarExchange(nombre);

        return ResponseEntity.ok(
                "Exchange eliminado correctamente: " + nombre);
    }

    // ==========================================
    // ADMINISTRACIÓN DE BINDINGS
    // ==========================================

    @PostMapping("/bindings")
    public ResponseEntity<String> crearBinding(
            @Valid @RequestBody BindingRequest request) {

        adminService.crearBinding(
                request.nombreCola(),
                request.nombreExchange(),
                request.routingKey());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Binding creado correctamente");
    }

    @DeleteMapping("/bindings")
    public ResponseEntity<String> eliminarBinding(
            @Valid @RequestBody BindingRequest request) {

        adminService.eliminarBinding(
                request.nombreCola(),
                request.nombreExchange(),
                request.routingKey());

        return ResponseEntity.ok("Binding eliminado correctamente");
    }

    // ==========================================
    // DTO: COLAS
    // ==========================================

    public record QueueRequest(

            @NotBlank(message = "El nombre de la cola es obligatorio")
            @Size(max = 200, message = "El nombre no puede superar los 200 caracteres")
            @Pattern(
                    regexp = "[a-zA-Z0-9._-]+",
                    message = "El nombre de la cola contiene caracteres no permitidos"
            )
            String nombre

    ) {}

    // ==========================================
    // DTO: EXCHANGES
    // ==========================================

    public record ExchangeRequest(

            @NotBlank(message = "El nombre del exchange es obligatorio")
            @Size(max = 200, message = "El nombre no puede superar los 200 caracteres")
            @Pattern(
                    regexp = "[a-zA-Z0-9._-]+",
                    message = "El nombre del exchange contiene caracteres no permitidos"
            )
            String nombre,

            @NotBlank(message = "El tipo de exchange es obligatorio")
            @Pattern(
                    regexp = "(?i)direct|topic",
                    message = "Tipo de exchange no válido. Utiliza direct o topic"
            )
            String tipo

    ) {}

    // ==========================================
    // DTO: BINDINGS
    // ==========================================

    public record BindingRequest(

            @NotBlank(message = "El nombre de la cola es obligatorio")
            @Size(max = 200, message = "El nombre de la cola no puede superar los 200 caracteres")
            @Pattern(
                    regexp = "[a-zA-Z0-9._-]+",
                    message = "El nombre de la cola contiene caracteres no permitidos"
            )
            String nombreCola,

            @NotBlank(message = "El nombre del exchange es obligatorio")
            @Size(max = 200, message = "El nombre del exchange no puede superar los 200 caracteres")
            @Pattern(
                    regexp = "[a-zA-Z0-9._-]+",
                    message = "El nombre del exchange contiene caracteres no permitidos"
            )
            String nombreExchange,

            @NotBlank(message = "La routing key es obligatoria")
            @Size(max = 200, message = "La routing key no puede superar los 200 caracteres")
            @Pattern(
                    regexp = "[a-zA-Z0-9._*#-]+",
                    message = "La routing key contiene caracteres no permitidos"
            )
            String routingKey

    ) {}
}

// ==========================================
// MANEJO GLOBAL DE ERRORES
// ==========================================

@RestControllerAdvice
class RabbitMQAdminExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(RabbitMQAdminExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> manejarValidacion(
            IllegalArgumentException exception) {

        logger.warn(
                "Validación fallida en administración de RabbitMQ: {}",
                exception.getMessage());

        return ResponseEntity.badRequest()
                .body(exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> manejarErroresDeCampos(
            MethodArgumentNotValidException exception) {

        String mensaje = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Los datos enviados no son válidos");

        logger.warn("Solicitud administrativa inválida: {}", mensaje);

        return ResponseEntity.badRequest().body(mensaje);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> manejarCuerpoInvalido(
            HttpMessageNotReadableException exception) {

        logger.warn("El cuerpo de la solicitud está vacío o tiene un formato inválido");

        return ResponseEntity.badRequest()
                .body("El cuerpo de la solicitud es obligatorio y debe tener un formato válido");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarError(Exception exception) {

        logger.error(
                "Error al ejecutar una operación administrativa de RabbitMQ",
                exception);

        return ResponseEntity.internalServerError()
                .body("No se pudo completar la operación administrativa");
    }
}
