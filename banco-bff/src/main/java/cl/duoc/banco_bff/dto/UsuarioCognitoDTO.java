package cl.duoc.banco_bff.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCognitoDTO {

    private String username;
    private String email;
    private String estado;
    private boolean habilitado;
    private List<String> grupos;
    private String rol;
    private boolean autorizado;
}