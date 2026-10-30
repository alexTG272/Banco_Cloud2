package cl.duoc.banco_bff.config;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .requestInterceptor((request, body, execution) -> {

                    ServletRequestAttributes attributes =
                            (ServletRequestAttributes)
                                    RequestContextHolder.getRequestAttributes();

                    if (attributes != null) {
                        HttpServletRequest currentRequest =
                                attributes.getRequest();

                        String authorization =
                                currentRequest.getHeader(
                                        HttpHeaders.AUTHORIZATION
                                );

                        if (authorization != null &&
                                !authorization.isBlank()) {

                            request.getHeaders().set(
                                    HttpHeaders.AUTHORIZATION,
                                    authorization
                            );
                        }
                    }

                    return execution.execute(request, body);
                })
                .build();
    }
}
