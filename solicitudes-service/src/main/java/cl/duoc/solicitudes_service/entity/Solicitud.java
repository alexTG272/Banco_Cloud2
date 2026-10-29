package cl.duoc.solicitudes_service.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tipoCuenta;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoInicial;


    @Column(nullable = false)
    private String estado;


    @Column(nullable = false)
    private String cliente;


    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;
}