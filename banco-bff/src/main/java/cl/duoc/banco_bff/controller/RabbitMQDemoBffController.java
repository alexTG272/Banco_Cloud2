package cl.duoc.banco_bff.controller;

import cl.duoc.banco_bff.service.RabbitMQDemoBffService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/rabbitmq/demo")
public class RabbitMQDemoBffController {

    private final RabbitMQDemoBffService demoService;

    public RabbitMQDemoBffController(
            RabbitMQDemoBffService demoService
    ) {
        this.demoService = demoService;
    }

    @PostMapping("/send")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<Map<?, ?>> enviarMensaje(
            @RequestBody DemoMessageRequest request
    ) {

        if (request == null ||
                request.contenido() == null ||
                request.contenido().isBlank()) {

            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.accepted()
                .body(demoService.enviarMensaje(
                        request.contenido()
                ));
    }

    @GetMapping("/status/{id}")
    @PreAuthorize("hasAuthority('ROLE_Empleado')")
    public ResponseEntity<Map<?, ?>> consultarEstado(
            @PathVariable String id
    ) {

        Map<?, ?> estado = demoService.consultarEstado(id);

        if (estado == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(estado);
    }

    public record DemoMessageRequest(String contenido) {
    }
}
