
package cl.duoc.solicitudes_service.controller;

import cl.duoc.solicitudes_service.messaging.demo.DemoMessage;
import cl.duoc.solicitudes_service.messaging.demo.DemoMessagePublisher;
import cl.duoc.solicitudes_service.service.DemoMessageStatusService;
import cl.duoc.solicitudes_service.service.DemoMessageStatusService.DemoMessageStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/rabbitmq/demo")
public class DemoMessageController {

    private final DemoMessagePublisher publisher;
    private final DemoMessageStatusService statusService;

    public DemoMessageController(
            DemoMessagePublisher publisher,
            DemoMessageStatusService statusService
    ) {
        this.publisher = publisher;
        this.statusService = statusService;
    }

    @PostMapping("/send")
    public ResponseEntity<DemoMessage> enviarMensaje(
            @Valid @RequestBody DemoMessageRequest request
    ) {

        if (request == null) {
            return ResponseEntity.badRequest().build();
        }

        DemoMessage mensaje = publisher.publicar(request.contenido());

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(mensaje);
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<DemoMessageStatus> consultarEstado(
            @PathVariable String id
    ) {

        DemoMessageStatus estado = statusService.consultar(id);

        if (estado == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(estado);
    }

    public record DemoMessageRequest(

            @NotBlank(message = "El contenido del mensaje es obligatorio")
            String contenido

    ) {
    }
}
