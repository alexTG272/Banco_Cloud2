package cl.duoc.cuentas_service.controller;

import cl.duoc.cuentas_service.entity.Cuenta;
import cl.duoc.cuentas_service.service.CuentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    public ResponseEntity<List<Cuenta>> listarCuentas() {
        return ResponseEntity.ok(
                cuentaService.listarCuentas()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cuenta> buscarPorId(
            @PathVariable Long id) {

        return cuentaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/saldo")
    public ResponseEntity<BigDecimal> consultarSaldo(
            @PathVariable Long id) {

        return cuentaService.buscarPorId(id)
                .map(cuenta -> ResponseEntity.ok(cuenta.getSaldo()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cuenta> crearCuenta(
            @RequestBody Cuenta cuenta) {

        return ResponseEntity.ok(
                cuentaService.crearCuenta(cuenta)
        );
    }

    @PutMapping("/{id}/numero")
    public ResponseEntity<Cuenta> asignarNumeroCuenta(
            @PathVariable Long id,
            @RequestParam String numeroCuenta) {

        return ResponseEntity.ok(
                cuentaService.asignarNumeroCuenta(id, numeroCuenta)
        );
    }
}

