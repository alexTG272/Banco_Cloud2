
package cl.duoc.solicitudes_service.messaging.demo;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cl.duoc.solicitudes_service.config.RabbitMQProperties;
import cl.duoc.solicitudes_service.service.DemoMessageStatusService;

@Component
public class DemoMessagePublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;
    private final DemoMessageStatusService statusService;

    @Value("${app.rabbitmq.publisher-confirm-timeout:10000}")
    private long publisherConfirmTimeout;

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

        statusService.registrar(
                mensaje.id(),
                mensaje.contenido()
        );

        try {
            CorrelationData correlationData =
                    new CorrelationData(UUID.randomUUID().toString());

            rabbitTemplate.convertAndSend(
                    properties.demoExchange(),
                    properties.demoRoutingKey(),
                    mensaje,
                    correlationData
            );

            CorrelationData.Confirm confirmacion =
                    correlationData.getFuture().get(
                            publisherConfirmTimeout,
                            TimeUnit.MILLISECONDS
                    );

            if (!confirmacion.isAck()) {
                throw new IllegalStateException(
                        "RabbitMQ rechazó la publicación: "
                                + confirmacion.getReason()
                );
            }

            if (correlationData.getReturned() != null) {
                throw new IllegalStateException(
                        "RabbitMQ devolvió el mensaje porque no encontró "
                                + "una cola de destino para el routing key: "
                                + properties.demoRoutingKey()
                );
            }

            return mensaje;

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            statusService.marcarFallido(mensaje.id());

            throw new IllegalStateException(
                    "La espera de confirmación de RabbitMQ fue interrumpida",
                    exception
            );

        } catch (Exception exception) {

            statusService.marcarFallido(mensaje.id());

            throw new IllegalStateException(
                    "No se pudo confirmar la publicación del mensaje demo",
                    exception
            );
        }
    }
}
