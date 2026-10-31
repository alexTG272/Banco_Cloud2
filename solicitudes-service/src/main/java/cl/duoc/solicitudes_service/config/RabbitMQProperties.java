package cl.duoc.solicitudes_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rabbitmq")
public record RabbitMQProperties(
        String exchange,
        String solicitudQueue,
        String solicitudRoutingKey,
        String deadLetterExchange,
        String deadLetterQueue,
        String deadLetterRoutingKey,
        String retryExchange,
        String retryQueue,
        String retryRoutingKey,
        Integer retryTtl,
        Integer maxAttempts,
        String demoExchange,
        String demoQueue,
        String demoRoutingKey
) {
}
