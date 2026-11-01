package cl.duoc.solicitudes_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RabbitMQProperties.class)
public class RabbitMQConfig {

    @Bean
    public TopicExchange solicitudExchange(RabbitMQProperties properties) {
        return new TopicExchange(properties.exchange(), true, false);
    }

    @Bean
    public DirectExchange deadLetterExchange(RabbitMQProperties properties) {
        return new DirectExchange(
                properties.deadLetterExchange(), true, false);
    }

    @Bean
    public Queue solicitudQueue(RabbitMQProperties properties) {
        return QueueBuilder.durable(properties.solicitudQueue())
                .deadLetterExchange(properties.deadLetterExchange())
                .deadLetterRoutingKey(properties.deadLetterRoutingKey())
                .build();
    }

    @Bean
    public Queue deadLetterQueue(RabbitMQProperties properties) {
        return QueueBuilder.durable(properties.deadLetterQueue()).build();
    }

    @Bean
    public Binding solicitudBinding(
            @Qualifier("solicitudQueue") Queue solicitudQueue,
            @Qualifier("solicitudExchange") TopicExchange solicitudExchange,
            RabbitMQProperties properties) {

        return BindingBuilder.bind(solicitudQueue)
                .to(solicitudExchange)
                .with(properties.solicitudRoutingKey());
    }

    @Bean
    public Binding deadLetterBinding(
            @Qualifier("deadLetterQueue") Queue deadLetterQueue,
            @Qualifier("deadLetterExchange") DirectExchange deadLetterExchange,
            RabbitMQProperties properties) {

        return BindingBuilder.bind(deadLetterQueue)
                .to(deadLetterExchange)
                .with(properties.deadLetterRoutingKey());
    }

    // Exchange para los mensajes que necesitan reintento
    @Bean
    public DirectExchange retryExchange(RabbitMQProperties properties) {
        return new DirectExchange(
                properties.retryExchange(), true, false);
    }

    // Cola de espera: después del TTL devuelve el mensaje
    // al exchange principal de solicitudes
    @Bean
    public Queue retryQueue(RabbitMQProperties properties) {
        return QueueBuilder.durable(properties.retryQueue())
                .ttl(properties.retryTtl())
                .deadLetterExchange(properties.exchange())
                .deadLetterRoutingKey(properties.solicitudRoutingKey())
                .build();
    }

    @Bean
    public Binding retryBinding(
            @Qualifier("retryQueue") Queue retryQueue,
            @Qualifier("retryExchange") DirectExchange retryExchange,
            RabbitMQProperties properties) {

        return BindingBuilder.bind(retryQueue)
                .to(retryExchange)
                .with(properties.retryRoutingKey());
    }

    // Recursos exclusivos para la demostración
    @Bean
    public DirectExchange demoExchange(RabbitMQProperties properties) {
        return new DirectExchange(properties.demoExchange(), true, false);
    }

    @Bean
    public Queue demoQueue(RabbitMQProperties properties) {
        return QueueBuilder.durable(properties.demoQueue())
            .deadLetterExchange(properties.deadLetterExchange())
            .deadLetterRoutingKey(properties.deadLetterRoutingKey())
            .build();
    }

    @Bean
    public Binding demoBinding(
            @Qualifier("demoQueue") Queue demoQueue,
            @Qualifier("demoExchange") DirectExchange demoExchange,
            RabbitMQProperties properties) {

        return BindingBuilder.bind(demoQueue)
                .to(demoExchange)
                .with(properties.demoRoutingKey());
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {

        SimpleRabbitListenerContainerFactory factory =
                new SimpleRabbitListenerContainerFactory();

        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        factory.setDefaultRequeueRejected(false);

        return factory;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }
}
