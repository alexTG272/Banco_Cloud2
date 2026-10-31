
package cl.duoc.solicitudes_service.messaging;

import com.rabbitmq.client.Channel;

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
    ) throws Exception {

        long deliveryTag =
                mensajeOriginal.getMessageProperties().getDeliveryTag();

        try {
            logger.info(
                    "Mensaje recibido desde RabbitMQ. ID: {}, Contenido: {}",
                    mensaje.id(),
                    mensaje.contenido()
            );

            // Simulación del procesamiento.
            logger.info(
                    "Procesando mensaje: {}",
                    mensaje.id()
            );

            // Confirmamos el procesamiento a RabbitMQ.
            channel.basicAck(deliveryTag, false);

            // Actualizamos el estado después de enviar el ACK.
            statusService.marcarProcesado(mensaje.id());

            logger.info(
                    "Mensaje procesado y ACK enviado. ID: {}",
                    mensaje.id()
            );

        } catch (Exception exception) {

            logger.error(
                    "Error procesando mensaje de demostración: {}",
                    mensaje.id(),
                    exception
            );

            statusService.marcarFallido(mensaje.id());

            // Rechazamos el mensaje sin reencolarlo.
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
