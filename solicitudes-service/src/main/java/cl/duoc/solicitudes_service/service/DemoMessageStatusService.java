package cl.duoc.solicitudes_service.service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Service;

@Service
public class DemoMessageStatusService {

    private final ConcurrentMap<String, DemoMessageStatus> mensajes =
            new ConcurrentHashMap<>();

    public void registrar(String id, String contenido) {
        mensajes.put(id, new DemoMessageStatus(
                id,
                contenido,
                "PUBLICADO",
                Instant.now(),
                null
        ));
    }

    public void marcarProcesado(String id) {
        mensajes.computeIfPresent(id, (key, actual) ->
                new DemoMessageStatus(
                        actual.id(),
                        actual.contenido(),
                        "PROCESADO_ACK_ENVIADO",
                        actual.fechaPublicacion(),
                        Instant.now()
                )
        );
    }

    public void marcarFallido(String id) {
        mensajes.computeIfPresent(id, (key, actual) ->
                new DemoMessageStatus(
                        actual.id(),
                        actual.contenido(),
                        "ERROR",
                        actual.fechaPublicacion(),
                        Instant.now()
                )
        );
    }

    public DemoMessageStatus consultar(String id) {
        return mensajes.get(id);
    }

    public record DemoMessageStatus(
            String id,
            String contenido,
            String estado,
            Instant fechaPublicacion,
            Instant fechaProcesamiento
    ) {
    }
}
