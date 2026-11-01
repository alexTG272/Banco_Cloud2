package cl.duoc.solicitudes_service.service;

import cl.duoc.solicitudes_service.entity.Solicitud;
import cl.duoc.solicitudes_service.messaging.solicitudes.SolicitudEvent;
import cl.duoc.solicitudes_service.messaging.solicitudes.SolicitudEventPublisher;
import cl.duoc.solicitudes_service.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final SolicitudEventPublisher eventPublisher;

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            SolicitudEventPublisher eventPublisher) {
        this.solicitudRepository = solicitudRepository;
        this.eventPublisher = eventPublisher;
    }

    public Solicitud crearSolicitud(Solicitud solicitud) {
        solicitud.setEstado("PENDIENTE");
        solicitud.setFechaSolicitud(LocalDateTime.now());

        Solicitud guardada = solicitudRepository.save(solicitud);

        SolicitudEvent evento = new SolicitudEvent(
                guardada.getId(),
                guardada.getTipoCuenta(),
                guardada.getMontoInicial(),
                guardada.getCliente(),
                guardada.getEstado(),
                guardada.getFechaSolicitud()
        );

        eventPublisher.publicarSolicitudCreada(evento);

        return guardada;
    }

    public List<Solicitud> listarSolicitudes() {
        return solicitudRepository.findAll();
    }

    public Optional<Solicitud> buscarPorId(Long id) {
        return solicitudRepository.findById(id);
    }

    public Solicitud aprobarSolicitud(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstado("APROBADA");

        return solicitudRepository.save(solicitud);
    }

    public Solicitud rechazarSolicitud(Long id) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstado("RECHAZADA");

        return solicitudRepository.save(solicitud);
    }
}
