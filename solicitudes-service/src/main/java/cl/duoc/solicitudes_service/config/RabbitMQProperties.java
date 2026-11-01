
package cl.duoc.solicitudes_service.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.rabbitmq")
public record RabbitMQProperties(

        @NotBlank(message = "El exchange principal es obligatorio")
        String exchange,

        @NotBlank(message = "La cola de solicitudes es obligatoria")
        String solicitudQueue,

        @NotBlank(message = "La routing key de solicitudes es obligatoria")
        String solicitudRoutingKey,

        @NotBlank(message = "El exchange DLQ es obligatorio")
        String deadLetterExchange,

        @NotBlank(message = "La cola DLQ es obligatoria")
        String deadLetterQueue,

        @NotBlank(message = "La routing key DLQ es obligatoria")
        String deadLetterRoutingKey,

        @NotBlank(message = "El exchange de reintentos es obligatorio")
        String retryExchange,

        @NotBlank(message = "La cola de reintentos es obligatoria")
        String retryQueue,

        @NotBlank(message = "La routing key de reintentos es obligatoria")
        String retryRoutingKey,

        @NotNull(message = "El TTL de reintentos es obligatorio")
        @Min(value = 1, message = "El TTL debe ser mayor que cero")
        Integer retryTtl,

        @NotNull(message = "La cantidad máxima de intentos es obligatoria")
        @Min(value = 1, message = "Debe existir al menos un intento")
        Integer maxAttempts,

        @NotBlank(message = "El exchange demo es obligatorio")
        String demoExchange,

        @NotBlank(message = "La cola demo es obligatoria")
        String demoQueue,

        @NotBlank(message = "La routing key demo es obligatoria")
        String demoRoutingKey

) {
}
