package cl.duoc.banco_bff.controller;

import cl.duoc.banco_bff.dto.SolicitudDTO;
import cl.duoc.banco_bff.service.SolicitudBffService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudBffController {

    private final SolicitudBffService solicitudBffService;

    public SolicitudBffController(
            SolicitudBffService solicitudBffService) {

        this.solicitudBffService = solicitudBffService;
    }

    @GetMapping
    public ResponseEntity<List<SolicitudDTO>> listarSolicitudes(
            JwtAuthenticationToken authentication) {

        if (esEmpleado(authentication)) {
            return ResponseEntity.ok(
                    solicitudBffService.listarTodas()
            );
        }

        String cliente = obtenerIdentificadorCliente(
                authentication
        );

        return ResponseEntity.ok(
                solicitudBffService.listarPorCliente(cliente)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudDTO> buscarSolicitud(
            @PathVariable Long id,
            JwtAuthenticationToken authentication) {

        SolicitudDTO solicitud =
                solicitudBffService.buscarSolicitud(id);

        if (solicitud == null) {
            return ResponseEntity.notFound().build();
        }

        if (esEmpleado(authentication)) {
            return ResponseEntity.ok(solicitud);
        }

        String cliente = obtenerIdentificadorCliente(
                authentication
        );

        if (!cliente.equals(solicitud.getCliente())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(solicitud);
    }

    @PostMapping
    public ResponseEntity<SolicitudDTO> crearSolicitud(
            @RequestBody SolicitudDTO solicitud,
            JwtAuthenticationToken authentication) {

        String cliente = obtenerIdentificadorCliente(
                authentication
        );

        return ResponseEntity.ok(
                solicitudBffService.crearSolicitud(
                        solicitud,
                        cliente
                )
        );
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudDTO> aprobarSolicitud(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                solicitudBffService.aprobarSolicitud(id)
        );
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudDTO> rechazarSolicitud(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                solicitudBffService.rechazarSolicitud(id)
        );
    }

    private boolean esEmpleado(
            JwtAuthenticationToken authentication) {

        return authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority
                                .getAuthority()
                                .equals("ROLE_Empleado")
                );
    }

    private String obtenerIdentificadorCliente(
            JwtAuthenticationToken authentication) {

        String username =
                authentication.getToken()
                        .getClaimAsString("username");

        if (username != null && !username.isBlank()) {
            return username;
        }

        return authentication.getToken().getSubject();
    }
}