
package cl.duoc.solicitudes_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Consultar solicitudes
                .requestMatchers(HttpMethod.GET, "/solicitudes/**")
                    .hasAnyRole("Cliente", "Empleado")

                // Crear solicitudes
                .requestMatchers(HttpMethod.POST, "/solicitudes")
                    .hasRole("Cliente")

                // Aprobar y rechazar solicitudes
                .requestMatchers(HttpMethod.PUT, "/solicitudes/*/aprobar")
                    .hasRole("Empleado")

                .requestMatchers(HttpMethod.PUT, "/solicitudes/*/rechazar")
                    .hasRole("Empleado")

                // Administración de RabbitMQ
                .requestMatchers("/api/admin/rabbitmq/**")
                    .hasRole("Empleado")

                // Bloquear cualquier otra ruta
                .anyRequest().denyAll()
            )
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter()
                    )
                )
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("cognito:groups");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }
}
