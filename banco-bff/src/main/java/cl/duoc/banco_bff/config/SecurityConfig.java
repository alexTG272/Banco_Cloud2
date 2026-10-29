package cl.duoc.banco_bff.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

//Modificado
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )

            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/actuator/health")
                    .permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()

                .requestMatchers("/api/admin/usuarios/**")
                    .hasRole("Empleado")

                .requestMatchers(HttpMethod.POST, "/api/cuentas")
                    .hasRole("Empleado")

                .requestMatchers(HttpMethod.PUT, "/api/cuentas/*/numero")
                    .hasRole("Empleado")

                .requestMatchers(HttpMethod.GET, "/api/cuentas/**")
                    .hasAnyRole("Cliente", "Empleado")

                .requestMatchers(HttpMethod.POST, "/api/solicitudes")
                    .hasRole("Cliente")

                .requestMatchers(HttpMethod.GET, "/api/solicitudes/**")
                    .hasAnyRole("Cliente", "Empleado")

                .requestMatchers(HttpMethod.PUT, "/api/solicitudes/*/aprobar")
                    .hasRole("Empleado")

                .requestMatchers(HttpMethod.PUT, "/api/solicitudes/*/rechazar")
                    .hasRole("Empleado")

                .anyRequest()
                    .authenticated()
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
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5173",
                "https://main.d2cp0cpk6yob92.amplifyapp.com"
            )
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
            new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName(
            "cognito:groups"
        );

        authoritiesConverter.setAuthorityPrefix(
            "ROLE_"
        );

        JwtAuthenticationConverter converter =
            new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
            authoritiesConverter
        );

        return converter;
    }
}