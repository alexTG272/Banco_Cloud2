package cl.duoc.solicitudes_service.controller;

import cl.duoc.solicitudes_service.service.RabbitMQAdminService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestController
@RequestMapping("/api/admin/rabbitmq")
public class RabbitMQAdminController {

    private final RabbitMQAdminService adminService;

    public RabbitMQAdminController(RabbitMQAdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/queues")
    public ResponseEntity<String> crearCola(@RequestBody QueueRequest request) {
        adminService.crearCola(request.nombre());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Cola creada correctamente: " + request.nombre());
    }

    @DeleteMapping("/queues")
    public ResponseEntity<String> eliminarCola(@RequestParam String nombre) {
        adminService.eliminarCola(nombre);
        return ResponseEntity.ok("Cola eliminada correctamente: " + nombre);
    }

    @PostMapping("/exchanges")
    public ResponseEntity<String> crearExchange(
            @RequestBody ExchangeRequest request) {
        adminService.crearExchange(request.nombre(), request.tipo());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Exchange creado correctamente: " + request.nombre());
    }

    @DeleteMapping("/exchanges")
    public ResponseEntity<String> eliminarExchange(
            @RequestParam String nombre) {
        adminService.eliminarExchange(nombre);
        return ResponseEntity.ok("Exchange eliminado correctamente: " + nombre);
    }

    @PostMapping("/bindings")
    public ResponseEntity<String> crearBinding(
            @RequestBody BindingRequest request) {
        adminService.crearBinding(
                request.nombreCola(),
                request.nombreExchange(),
                request.routingKey());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Binding creado correctamente");
    }

    @DeleteMapping("/bindings")
    public ResponseEntity<String> eliminarBinding(
            @RequestBody BindingRequest request) {
        adminService.eliminarBinding(
                request.nombreCola(),
                request.nombreExchange(),
                request.routingKey());

        return ResponseEntity.ok("Binding eliminado correctamente");
    }

    public record QueueRequest(String nombre) {}

    public record ExchangeRequest(String nombre, String tipo) {}

    public record BindingRequest(
            String nombreCola,
            String nombreExchange,
            String routingKey) {}
}

@RestControllerAdvice
class RabbitMQAdminExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> manejarValidacion(
            IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarError(Exception exception) {
        return ResponseEntity.internalServerError()
                .body("No se pudo completar la operación administrativa");
    }
}

