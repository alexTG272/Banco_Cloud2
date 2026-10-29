package cl.duoc.banco_bff.service;

import cl.duoc.banco_bff.dto.UsuarioCognitoDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminListGroupsForUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

import java.util.ArrayList;
import java.util.List;

@Service
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final String userPoolId;
    private final String clienteGroup;

    public CognitoService(
            @Value("${aws.region}") String region,
            @Value("${aws.cognito.user-pool-id}") String userPoolId,
            @Value("${aws.cognito.cliente-group}") String clienteGroup) {

        this.userPoolId = userPoolId;
        this.clienteGroup = clienteGroup;

        this.cognitoClient = CognitoIdentityProviderClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public List<UsuarioCognitoDTO> listarUsuarios() {

        List<UsuarioCognitoDTO> usuarios = new ArrayList<>();

        ListUsersRequest request = ListUsersRequest.builder()
                .userPoolId(userPoolId)
                .build();

        for (UserType usuario : cognitoClient.listUsers(request).users()) {

            String email = usuario.attributes()
                    .stream()
                    .filter(attribute -> "email".equals(attribute.name()))
                    .map(attribute -> attribute.value())
                    .findFirst()
                    .orElse("");

            List<String> grupos = obtenerGrupos(usuario.username());

            String rol = determinarRol(grupos);

            boolean autorizado = grupos.contains(clienteGroup);

            UsuarioCognitoDTO dto = new UsuarioCognitoDTO(
                    usuario.username(),
                    email,
                    usuario.userStatusAsString(),
                    Boolean.TRUE.equals(usuario.enabled()),
                    grupos,
                    rol,
                    autorizado
            );

            usuarios.add(dto);
        }

        return usuarios;
    }

    public UsuarioCognitoDTO autorizarCliente(String username) {

        AdminAddUserToGroupRequest request =
                AdminAddUserToGroupRequest.builder()
                        .userPoolId(userPoolId)
                        .username(username)
                        .groupName(clienteGroup)
                        .build();

        cognitoClient.adminAddUserToGroup(request);

        UserType usuario = cognitoClient.listUsers(
                ListUsersRequest.builder()
                        .userPoolId(userPoolId)
                        .filter("username = \"" + username + "\"")
                        .build()
        ).users()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado en Cognito")
                );

        String email = usuario.attributes()
                .stream()
                .filter(attribute -> "email".equals(attribute.name()))
                .map(attribute -> attribute.value())
                .findFirst()
                .orElse("");

        List<String> grupos = obtenerGrupos(username);

        String rol = determinarRol(grupos);

        boolean autorizado = grupos.contains(clienteGroup);

        return new UsuarioCognitoDTO(
                usuario.username(),
                email,
                usuario.userStatusAsString(),
                Boolean.TRUE.equals(usuario.enabled()),
                grupos,
                rol,
                autorizado
        );
    }

    private String determinarRol(List<String> grupos) {

        if (grupos.contains("Empleado")) {
            return "Empleado";
        }

        if (grupos.contains(clienteGroup)) {
            return "Cliente";
        }

        return "Sin rol";
    }

    private List<String> obtenerGrupos(String username) {

        AdminListGroupsForUserRequest request =
                AdminListGroupsForUserRequest.builder()
                        .userPoolId(userPoolId)
                        .username(username)
                        .build();

        return cognitoClient.adminListGroupsForUser(request)
                .groups()
                .stream()
                .map(group -> group.groupName())
                .toList();
    }
}