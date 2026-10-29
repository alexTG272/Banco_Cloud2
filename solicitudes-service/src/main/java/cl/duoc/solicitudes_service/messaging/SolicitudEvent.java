package cl.duoc.solicitudes_service.messaging;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SolicitudEvent(
        Long solicitudId,
        String tipoCuenta,
        BigDecimal montoInicial,
        String cliente,
        String estado,
        LocalDateTime fechaSolicitud
) {
}