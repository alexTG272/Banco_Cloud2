package cl.duoc.banco_bff.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudDTO {

    private Long id;
    private String tipoCuenta;
    private BigDecimal montoInicial;
    private String estado;
    private String cliente;
    private LocalDateTime fechaSolicitud;
}
