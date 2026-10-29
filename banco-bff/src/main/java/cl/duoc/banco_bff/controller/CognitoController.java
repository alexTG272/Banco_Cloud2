package cl.duoc.banco_bff.controller;

import cl.duoc.banco_bff.dto.UsuarioCognitoDTO;
import cl.duoc.banco_bff.service.CognitoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/usuarios")
public class CognitoController {

    private final CognitoService cognitoService;

    public CognitoController(CognitoService cognitoService) {
        this.cognitoService = cognitoService;
    }

    @GetMapping
    public List<UsuarioCognitoDTO> listarUsuarios() {
        return cognitoService.listarUsuarios();
    }

    @PutMapping("/{username}/autorizar")
    public UsuarioCognitoDTO autorizarCliente(
            @PathVariable String username) {

        return cognitoService.autorizarCliente(username);
    }
}