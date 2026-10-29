package cl.duoc.solicitudes_service.controller;

import cl.duoc.solicitudes_service.entity.Solicitud;
import cl.duoc.solicitudes_service.service.SolicitudService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/solicitudes")

public class SolicitudController {
    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }


    @PostMapping
    public ResponseEntity<Solicitud> crearSolicitud(
            @RequestBody Solicitud solicitud) {
        return ResponseEntity.ok(
                solicitudService.crearSolicitud(solicitud)
        );
    }

    @GetMapping
    public ResponseEntity<List<Solicitud>> listarSolicitudes() {
        return ResponseEntity.ok(
                solicitudService.listarSolicitudes()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solicitud> buscarPorId(
            @PathVariable Long id) {
        return solicitudService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Solicitud> aprobarSolicitud(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                solicitudService.aprobarSolicitud(id)
        );
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Solicitud> rechazarSolicitud(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                solicitudService.rechazarSolicitud(id)
        );
    }
}