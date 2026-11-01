
package cl.duoc.solicitudes_service.messaging.solicitudes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import cl.duoc.solicitudes_service.entity.Solicitud;
import cl.duoc.solicitudes_service.repository.SolicitudRepository;

@Service
public class SolicitudEventProcessor {

    private static final Logger log =
            LoggerFactory.getLogger(SolicitudEventProcessor.class);

    private final SolicitudRepository solicitudRepository;

    public SolicitudEventProcessor(
            SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    public void procesar(SolicitudEvent evento) {

        if (evento == null || evento.solicitudId() == null) {
            throw new IllegalArgumentException(
                    "El evento o el ID de solicitud no pueden ser nulos");
        }

        Solicitud solicitud = solicitudRepository
                .findById(evento.solicitudId())
                .orElseThrow(() -> new IllegalStateException(
                        "No existe la solicitud con ID "
                                + evento.solicitudId()));

        boolean montoCoincide = compararMontos(
                solicitud.getMontoInicial(),
                evento.montoInicial());

        boolean fechaCoincide = compararFechas(
                solicitud.getFechaSolicitud(),
                evento.fechaSolicitud());

        boolean datosCoinciden =
                Objects.equals(solicitud.getTipoCuenta(), evento.tipoCuenta())
                && montoCoincide
                && Objects.equals(solicitud.getCliente(), evento.cliente())
                && Objects.equals(solicitud.getEstado(), evento.estado())
                && fechaCoincide;

        if (!datosCoinciden) {

            log.warn(
                    "Diferencia en los datos del evento. Solicitud ID: {}, "
                    + "tipoCuenta={}, monto={}, cliente={}, estado={}, fecha={}",
                    solicitud.getId(),
                    Objects.equals(solicitud.getTipoCuenta(), evento.tipoCuenta()),
                    montoCoincide,
                    Objects.equals(solicitud.getCliente(), evento.cliente()),
                    Objects.equals(solicitud.getEstado(), evento.estado()),
                    fechaCoincide
            );

            log.warn(
                    "Comparación de fechas - BD: [{}], Evento: [{}]",
                    solicitud.getFechaSolicitud(),
                    evento.fechaSolicitud()
            );

            throw new IllegalStateException(
                    "Los datos del evento no coinciden con la solicitud "
                            + evento.solicitudId());
        }

        log.info(
                "Evento procesado correctamente. Solicitud ID: {}",
                solicitud.getId());
    }

    private boolean compararMontos(
            BigDecimal montoBD,
            BigDecimal montoEvento) {

        if (montoBD == null || montoEvento == null) {
            return montoBD == montoEvento;
        }

        return montoBD.compareTo(montoEvento) == 0;
    }

    private boolean compararFechas(
            LocalDateTime fechaBD,
            LocalDateTime fechaEvento) {

        if (fechaBD == null || fechaEvento == null) {
            return fechaBD == fechaEvento;
        }

        // MySQL conserva microsegundos. Redondeamos el evento
        // al microsegundo más cercano antes de compararlo.
        LocalDateTime fechaEventoNormalizada =
                fechaEvento.plusNanos(500)
                        .truncatedTo(ChronoUnit.MICROS);

        LocalDateTime fechaBDNormalizada =
                fechaBD.truncatedTo(ChronoUnit.MICROS);

        return fechaBDNormalizada.equals(fechaEventoNormalizada);
    }
}
