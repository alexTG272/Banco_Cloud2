package cl.duoc.solicitudes_service.messaging.demo;

import com.rabbitmq.client.Channel;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import cl.duoc.solicitudes_service.service.DemoMessageStatusService;

@Component
public class DemoMessageConsumer {

    private static final Logger logger =
            LoggerFactory.getLogger(DemoMessageConsumer.class);

    private final DemoMessageStatusService statusService;

    public DemoMessageConsumer(
            DemoMessageStatusService statusService
    ) {
        this.statusService = statusService;
    }

    @RabbitListener(
            queues = "${app.rabbitmq.demo-queue}",
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void recibirMensaje(
            DemoMessage mensaje,
            Message mensajeOriginal,
            Channel channel
    ) throws IOException {

        long deliveryTag =
                mensajeOriginal.getMessageProperties().getDeliveryTag();

        try {
            if (mensaje == null
                    || mensaje.id() == null
                    || mensaje.id().isBlank()
                    || mensaje.contenido() == null
                    || mensaje.contenido().isBlank()) {

                throw new IllegalArgumentException(
                        "El mensaje demo contiene datos obligatorios inválidos"
                );
            }

            logger.info(
                    "Mensaje recibido desde RabbitMQ. ID: {}, Contenido: {}",
                    mensaje.id(),
                    mensaje.contenido()
            );

            logger.info(
                    "Procesando mensaje: {}",
                    mensaje.id()
            );

            // Actualizamos el estado antes de confirmar el mensaje.
            statusService.marcarProcesado(mensaje.id());

        } catch (Exception exception) {

            logger.error(
                    "Error procesando mensaje demo. Se enviará a la DLQ. ID: {}",
                    mensaje != null ? mensaje.id() : "desconocido",
                    exception
            );

            if (mensaje != null
                    && mensaje.id() != null
                    && !mensaje.id().isBlank()) {

                statusService.marcarFallido(mensaje.id());
            }

            // Rechazamos el mensaje sin reencolar.
            // La configuración DLX de demoQueue lo enviará a la DLQ.
            channel.basicNack(deliveryTag, false, false);

            return;
        }

        // Confirmamos únicamente después de actualizar el estado.
        channel.basicAck(deliveryTag, false);

        logger.info(
                "Mensaje procesado correctamente. ACK enviado. ID: {}",
                mensaje.id()
        );
    }
}
