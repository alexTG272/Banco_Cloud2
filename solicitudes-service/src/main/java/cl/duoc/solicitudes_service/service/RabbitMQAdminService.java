package cl.duoc.solicitudes_service.service;

import java.util.Map;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Exchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class RabbitMQAdminService {

    private final RabbitAdmin rabbitAdmin;

    public RabbitMQAdminService(RabbitAdmin rabbitAdmin) {
        this.rabbitAdmin = rabbitAdmin;
    }

    public void crearCola(String nombre) {
        validarNombre(nombre);
        rabbitAdmin.declareQueue(new Queue(nombre, true));
    }

    public void eliminarCola(String nombre) {
        validarNombre(nombre);
        rabbitAdmin.deleteQueue(nombre);
    }

    public void crearExchange(String nombre, String tipo) {
        validarNombre(nombre);

        if (!StringUtils.hasText(tipo)) {
            throw new IllegalArgumentException("El tipo de exchange es obligatorio");
        }

        Exchange exchange;

        switch (tipo.trim().toLowerCase()) {
            case "direct" ->
                exchange = new DirectExchange(nombre, true, false);
            case "topic" ->
                exchange = new TopicExchange(nombre, true, false);
            default ->
                throw new IllegalArgumentException(
                        "Tipo no válido. Utiliza direct o topic");
        }

        rabbitAdmin.declareExchange(exchange);
    }

    public void eliminarExchange(String nombre) {
        validarNombre(nombre);
        rabbitAdmin.deleteExchange(nombre);
    }

    public void crearBinding(
            String nombreCola,
            String nombreExchange,
            String routingKey) {

        validarNombre(nombreCola);
        validarNombre(nombreExchange);
        validarNombre(routingKey);

        Binding binding = new Binding(
                nombreCola,
                Binding.DestinationType.QUEUE,
                nombreExchange,
                routingKey,
                Map.of());

        rabbitAdmin.declareBinding(binding);
    }

    public void eliminarBinding(
            String nombreCola,
            String nombreExchange,
            String routingKey) {

        validarNombre(nombreCola);
        validarNombre(nombreExchange);
        validarNombre(routingKey);

        Binding binding = new Binding(
                nombreCola,
                Binding.DestinationType.QUEUE,
                nombreExchange,
                routingKey,
                Map.of());

        rabbitAdmin.removeBinding(binding);
    }

    private void validarNombre(String nombre) {
        if (!StringUtils.hasText(nombre)
                || !nombre.matches("[a-zA-Z0-9._-]{1,200}")) {
            throw new IllegalArgumentException(
                    "El nombre no es válido: utiliza entre 1 y 200 caracteres "
                    + "alfanuméricos, puntos, guiones o guiones bajos");
        }
    }
}
