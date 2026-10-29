package cl.duoc.banco_bff.controller;

import cl.duoc.banco_bff.dto.CuentaDTO;
import cl.duoc.banco_bff.service.CuentaBffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaBffController {

    private final CuentaBffService cuentaBffService;

    public CuentaBffController(CuentaBffService cuentaBffService) {
        this.cuentaBffService = cuentaBffService;
    }

    @GetMapping
    public ResponseEntity<List<CuentaDTO>> listarCuentas(
            JwtAuthenticationToken authentication) {

        if (esEmpleado(authentication)) {
            return ResponseEntity.ok(
                    cuentaBffService.listarTodas()
            );
        }

        String cliente =
                obtenerIdentificadorCliente(authentication);

        return ResponseEntity.ok(
                cuentaBffService.listarPorCliente(cliente)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuentaDTO> buscarCuenta(
            @PathVariable Long id,
            JwtAuthenticationToken authentication) {

        CuentaDTO cuenta =
                cuentaBffService.buscarCuenta(id);

        if (cuenta == null) {
            return ResponseEntity.notFound().build();
        }

        if (esEmpleado(authentication)) {
            return ResponseEntity.ok(cuenta);
        }

        String cliente =
                obtenerIdentificadorCliente(authentication);

        if (!cliente.equals(cuenta.getCliente())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(cuenta);
    }

    @GetMapping("/{id}/saldo")
    public ResponseEntity<BigDecimal> consultarSaldo(
            @PathVariable Long id,
            JwtAuthenticationToken authentication) {

        CuentaDTO cuenta =
                cuentaBffService.buscarCuenta(id);

        if (cuenta == null) {
            return ResponseEntity.notFound().build();
        }

        if (!esEmpleado(authentication)) {

            String cliente =
                    obtenerIdentificadorCliente(authentication);

            if (!cliente.equals(cuenta.getCliente())) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }
        }

        BigDecimal saldo =
                cuentaBffService.consultarSaldo(id);

        return ResponseEntity.ok(saldo);
    }

    @PostMapping
    public ResponseEntity<CuentaDTO> crearCuenta(
            @RequestBody CuentaDTO cuenta) {

        return ResponseEntity.ok(
                cuentaBffService.crearCuenta(cuenta)
        );
    }

    @PutMapping("/{id}/numero")
    public ResponseEntity<CuentaDTO> asignarNumeroCuenta(
            @PathVariable Long id,
            @RequestParam String numeroCuenta) {

        return ResponseEntity.ok(
                cuentaBffService.asignarNumeroCuenta(
                        id,
                        numeroCuenta
                )
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

        return authentication
                .getToken()
                .getSubject();
    }
}