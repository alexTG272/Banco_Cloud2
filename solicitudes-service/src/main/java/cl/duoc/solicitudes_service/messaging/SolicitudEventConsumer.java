
package cl.duoc.solicitudes_service.messaging;

import com.rabbitmq.client.Channel;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class SolicitudEventConsumer {

    private static final Logger log =
            LoggerFactory.getLogger(SolicitudEventConsumer.class);

    @RabbitListener(queues = "${app.rabbitmq.solicitud-queue}")
    public void procesarSolicitudCreada(
            SolicitudEvent evento,
            Message mensaje,
            Channel canal) throws IOException {

        long deliveryTag =
                mensaje.getMessageProperties().getDeliveryTag();

        try {
            if (evento == null) {
                throw new IllegalArgumentException(
                        "El evento de solicitud no puede ser nulo");
            }

            if (evento.solicitudId() == null
                    || evento.cliente() == null
                    || evento.cliente().isBlank()
                    || evento.estado() == null
                    || evento.estado().isBlank()) {
                throw new IllegalArgumentException(
                        "El evento contiene datos obligatorios inválidos");
            }

            log.info(
                    "Evento recibido: solicitudId={}, cliente={}, estado={}",
                    evento.solicitudId(),
                    evento.cliente(),
                    evento.estado()
            );

        } catch (Exception ex) {
            log.error(
                    "Error procesando el evento. Se enviará a la DLQ. deliveryTag={}",
                    deliveryTag,
                    ex
            );

            canal.basicNack(deliveryTag, false, false);
            return;
        }

        canal.basicAck(deliveryTag, false);

        log.info(
                "Mensaje confirmado correctamente. deliveryTag={}",
                deliveryTag
        );
    }
}
