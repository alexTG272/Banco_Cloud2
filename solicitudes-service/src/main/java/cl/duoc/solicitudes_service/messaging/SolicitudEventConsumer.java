
package cl.duoc.solicitudes_service.messaging;

import com.rabbitmq.client.Channel;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cl.duoc.solicitudes_service.config.RabbitMQProperties;

@Component
public class SolicitudEventConsumer {

    private static final Logger log =
            LoggerFactory.getLogger(SolicitudEventConsumer.class);

    private static final String RETRY_HEADER = "x-retry-count";

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQProperties properties;

    @Value("${app.rabbitmq.retry-test.enabled:false}")
    private boolean retryTestEnabled;

    @Value("${app.rabbitmq.publisher-confirm-timeout:10000}")
    private long publisherConfirmTimeout;

    public SolicitudEventConsumer(
            RabbitTemplate rabbitTemplate,
            RabbitMQProperties properties) {

        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    @RabbitListener(queues = "${app.rabbitmq.solicitud-queue}")
    public void procesarSolicitudCreada(
            SolicitudEvent evento,
            Message mensaje,
            Channel canal) throws IOException {

        long deliveryTag =
                mensaje.getMessageProperties().getDeliveryTag();

        // 1. Validar errores permanentes
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

        } catch (IllegalArgumentException ex) {

            log.error(
                    "Mensaje inválido. Se enviará directamente a la DLQ",
                    ex
            );

            canal.basicNack(deliveryTag, false, false);
            return;
        }

        // 2. Procesamiento del mensaje
        try {

            log.info(
                    "Procesando solicitud: id={}, cliente={}, estado={}",
                    evento.solicitudId(),
                    evento.cliente(),
                    evento.estado()
            );

            // Simulación exclusiva para pruebas locales
            if (retryTestEnabled
                    && "RETRY_TEST".equalsIgnoreCase(evento.estado())) {

                log.warn(
                        "Prueba local activada: simulando error temporal");

                throw new RuntimeException(
                        "Error temporal simulado para comprobar los reintentos");
            }

            /*
             * Aquí se ejecuta el procesamiento real de negocio.
             */

        } catch (Exception ex) {

            manejarErrorTemporal(
                    evento,
                    mensaje,
                    canal,
                    deliveryTag,
                    ex
            );

            return;
        }

        // 3. Confirmar el mensaje procesado correctamente
        // Este ACK queda fuera del catch de procesamiento.
        canal.basicAck(deliveryTag, false);

        log.info(
                "Solicitud procesada correctamente. ACK enviado. id={}",
                evento.solicitudId()
        );
    }

    private void manejarErrorTemporal(
            SolicitudEvent evento,
            Message mensaje,
            Channel canal,
            long deliveryTag,
            Exception excepcion) throws IOException {

        int reintentosRealizados = obtenerReintentos(mensaje);
        int maxIntentos = properties.maxAttempts();

        log.error(
                "Error temporal. Intento {} de {}",
                reintentosRealizados + 1,
                maxIntentos,
                excepcion
        );

        boolean quedanIntentos =
                reintentosRealizados < maxIntentos - 1;

        try {

            if (quedanIntentos) {

                int siguienteIntento = reintentosRealizados + 1;

                publicarYConfirmar(
                        properties.retryExchange(),
                        properties.retryRoutingKey(),
                        evento,
                        siguienteIntento
                );

                log.warn(
                        "Mensaje enviado y confirmado para reintento: {} de {}",
                        siguienteIntento,
                        maxIntentos - 1
                );

            } else {

                log.error(
                        "Se agotaron los {} intentos. Enviando a DLQ",
                        maxIntentos
                );

                publicarYConfirmar(
                        properties.deadLetterExchange(),
                        properties.deadLetterRoutingKey(),
                        evento,
                        reintentosRealizados
                );

                log.info(
                        "Mensaje publicado y confirmado en la DLQ. id={}",
                        evento.solicitudId()
                );
            }

        } catch (Exception errorPublicacion) {

            log.error(
                    "No se pudo confirmar la publicación. "
                            + "Se conservará el mensaje original mediante NACK",
                    errorPublicacion
            );

            canal.basicNack(deliveryTag, false, true);
            return;
        }

        // 4. ACK solamente después de confirmar la publicación
        canal.basicAck(deliveryTag, false);
    }

    private void publicarYConfirmar(
            String exchange,
            String routingKey,
            SolicitudEvent evento,
            int numeroReintento) throws Exception {

        CorrelationData correlationData =
                new CorrelationData(UUID.randomUUID().toString());

        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                evento,
                mensajeSalida -> {
                    mensajeSalida.getMessageProperties()
                            .setHeader(RETRY_HEADER, numeroReintento);

                    return mensajeSalida;
                },
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
                            + routingKey
            );
        }

        log.debug(
                "Publicación confirmada por RabbitMQ. exchange={}, routingKey={}",
                exchange,
                routingKey
        );
    }

    private int obtenerReintentos(Message mensaje) {

        Object valor = mensaje.getMessageProperties()
                .getHeader(RETRY_HEADER);

        if (valor instanceof Number numero) {
            return Math.max(0, numero.intValue());
        }

        if (valor instanceof String texto) {
            try {
                return Math.max(0, Integer.parseInt(texto));
            } catch (NumberFormatException ex) {
                log.warn(
                        "Encabezado de reintentos inválido. Se inicia en cero");
            }
        }

        return 0;
    }
}
