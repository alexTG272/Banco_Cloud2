package cl.duoc.solicitudes_service.messaging;

import cl.duoc.solicitudes_service.config.RabbitMQProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class SolicitudEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;

    public SolicitudEventPublisher(
            RabbitTemplate rabbitTemplate,
            RabbitMQProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    public void publicarSolicitudCreada(SolicitudEvent evento) {
        rabbitTemplate.convertAndSend(
                properties.exchange(),
                properties.solicitudRoutingKey(),
                evento
        );
    }
}