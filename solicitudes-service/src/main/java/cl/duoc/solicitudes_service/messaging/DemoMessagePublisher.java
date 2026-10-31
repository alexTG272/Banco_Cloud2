package cl.duoc.solicitudes_service.messaging;

import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import cl.duoc.solicitudes_service.config.RabbitMQProperties;
import cl.duoc.solicitudes_service.service.DemoMessageStatusService;

@Component
public class DemoMessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;
    private final DemoMessageStatusService statusService;

    public DemoMessagePublisher(
            RabbitTemplate rabbitTemplate,
            RabbitMQProperties properties,
            DemoMessageStatusService statusService
    ) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
        this.statusService = statusService;
    }

    public DemoMessage publicar(String contenido) {

        if (contenido == null || contenido.isBlank()) {
            throw new IllegalArgumentException(
                    "El contenido del mensaje no puede estar vacío"
            );
        }

        DemoMessage mensaje = new DemoMessage(
                UUID.randomUUID().toString(),
                contenido
        );

        // Registramos el mensaje antes de publicarlo.
        statusService.registrar(
                mensaje.id(),
                mensaje.contenido()
        );

        try {
            rabbitTemplate.convertAndSend(
                    properties.demoExchange(),
                    properties.demoRoutingKey(),
                    mensaje
            );

            return mensaje;

        } catch (Exception exception) {

            statusService.marcarFallido(mensaje.id());

            throw exception;
        }
    }
}

