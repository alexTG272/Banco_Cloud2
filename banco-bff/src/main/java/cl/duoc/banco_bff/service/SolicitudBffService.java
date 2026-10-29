package cl.duoc.banco_bff.service;

import cl.duoc.banco_bff.dto.CuentaDTO;
import cl.duoc.banco_bff.dto.SolicitudDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;

@Service
public class SolicitudBffService {

    private final RestClient restClient;
    private final CuentaBffService cuentaBffService;

    @Value("${solicitudes-service.url}")
    private String solicitudesServiceUrl;

    public SolicitudBffService(
            RestClient restClient,
            CuentaBffService cuentaBffService) {

        this.restClient = restClient;
        this.cuentaBffService = cuentaBffService;
    }

    public List<SolicitudDTO> listarTodas() {

        SolicitudDTO[] solicitudes = restClient.get()
                .uri(solicitudesServiceUrl + "/solicitudes")
                .retrieve()
                .body(SolicitudDTO[].class);

        return solicitudes != null
                ? Arrays.asList(solicitudes)
                : List.of();
    }

    public List<SolicitudDTO> listarPorCliente(
            String cliente) {

        return listarTodas()
                .stream()
                .filter(solicitud ->
                        cliente.equals(solicitud.getCliente()))
                .toList();
    }

    public SolicitudDTO buscarSolicitud(Long id) {

        return restClient.get()
                .uri(
                    solicitudesServiceUrl
                        + "/solicitudes/"
                        + id
                )
                .retrieve()
                .body(SolicitudDTO.class);
    }

    public SolicitudDTO crearSolicitud(
            SolicitudDTO solicitud,
            String cliente) {

        solicitud.setCliente(cliente);

        return restClient.post()
                .uri(solicitudesServiceUrl + "/solicitudes")
                .body(solicitud)
                .retrieve()
                .body(SolicitudDTO.class);
    }

    public SolicitudDTO aprobarSolicitud(Long id) {

        SolicitudDTO solicitud = restClient.put()
                .uri(
                    solicitudesServiceUrl
                        + "/solicitudes/"
                        + id
                        + "/aprobar"
                )
                .retrieve()
                .body(SolicitudDTO.class);

        if (solicitud == null) {
            throw new RuntimeException(
                    "No se pudo aprobar la solicitud"
            );
        }

        CuentaDTO cuenta = new CuentaDTO(
                null,
                null,
                solicitud.getTipoCuenta(),
                solicitud.getMontoInicial(),
                solicitud.getCliente()
        );

        CuentaDTO cuentaCreada =
                cuentaBffService.crearCuenta(cuenta);

        if (cuentaCreada == null
                || cuentaCreada.getId() == null) {

            throw new RuntimeException(
                    "La solicitud fue aprobada, pero no se pudo crear la cuenta"
            );
        }

        String numeroCuenta = String.format(
                "%010d",
                cuentaCreada.getId()
        );

        cuentaBffService.asignarNumeroCuenta(
                cuentaCreada.getId(),
                numeroCuenta
        );

        return solicitud;
    }

    public SolicitudDTO rechazarSolicitud(Long id) {

        return restClient.put()
                .uri(
                    solicitudesServiceUrl
                        + "/solicitudes/"
                        + id
                        + "/rechazar"
                )
                .retrieve()
                .body(SolicitudDTO.class);
    }
}