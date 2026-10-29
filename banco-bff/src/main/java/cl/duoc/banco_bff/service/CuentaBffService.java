package cl.duoc.banco_bff.service;

import cl.duoc.banco_bff.dto.CuentaDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class CuentaBffService {

    private final RestClient restClient;

    @Value("${cuentas-service.url}")
    private String cuentasServiceUrl;

    public CuentaBffService(RestClient restClient) {
        this.restClient = restClient;
    }

    public List<CuentaDTO> listarTodas() {

        CuentaDTO[] cuentas = restClient.get()
                .uri(cuentasServiceUrl + "/cuentas")
                .retrieve()
                .body(CuentaDTO[].class);

        return cuentas != null
                ? Arrays.asList(cuentas)
                : List.of();
    }

    public List<CuentaDTO> listarPorCliente(String cliente) {

        return listarTodas()
                .stream()
                .filter(cuenta ->
                        cliente.equals(cuenta.getCliente()))
                .toList();
    }

    public CuentaDTO buscarCuenta(Long id) {

        return restClient.get()
                .uri(cuentasServiceUrl + "/cuentas/" + id)
                .retrieve()
                .body(CuentaDTO.class);
    }

    public BigDecimal consultarSaldo(Long id) {

        return restClient.get()
                .uri(
                    cuentasServiceUrl
                        + "/cuentas/"
                        + id
                        + "/saldo"
                )
                .retrieve()
                .body(BigDecimal.class);
    }

    public CuentaDTO crearCuenta(CuentaDTO cuenta) {

        return restClient.post()
                .uri(cuentasServiceUrl + "/cuentas")
                .body(cuenta)
                .retrieve()
                .body(CuentaDTO.class);
    }

    public CuentaDTO asignarNumeroCuenta(
            Long id,
            String numeroCuenta) {

        return restClient.put()
                .uri(
                    cuentasServiceUrl
                        + "/cuentas/"
                        + id
                        + "/numero?numeroCuenta="
                        + numeroCuenta
                )
                .retrieve()
                .body(CuentaDTO.class);
    }
}