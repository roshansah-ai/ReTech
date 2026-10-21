
package retech_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // Local development only.
                // Enable CSRF protection before public deployment.
                .csrf(csrf -> csrf.disable())

                .securityContext(context ->
                        context.securityContextRepository(
                                new HttpSessionSecurityContextRepository()
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Allow preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Customer registration and login
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout"
                        )
                        .permitAll()

                        // Logged-in customer
                        .requestMatchers("/api/auth/me")
                        .hasRole("CUSTOMER")

                        // Public product browsing
                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .permitAll()

                        // Public checkout
                        .requestMatchers(HttpMethod.POST, "/api/orders")
                        .permitAll()

                        // Admin APIs
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Product management
                        .requestMatchers("/api/products/**")
                        .hasRole("ADMIN")

                        // Customer order history
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/history"
                        )
                        .hasRole("CUSTOMER")

                        // Individual order access
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/*"
                        )
                        .authenticated()

                        // All other requests
                        .anyRequest()
                        .authenticated()
                )

                // Keep HTTP Basic for Admin authentication,
                // but prevent Chrome's login popup.
                .httpBasic(basic ->
                        basic.authenticationEntryPoint(
                                (request, response, authException) -> {

                                    response.sendError(
                                            401,
                                            "Authentication required"
                                    );
                                }
                        )
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4300")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
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

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder
    ) {

        String adminPassword =
                System.getenv("RETECH_ADMIN_PASSWORD");

        if (adminPassword == null || adminPassword.isBlank()) {

            throw new IllegalStateException(
                    "Set RETECH_ADMIN_PASSWORD before starting the backend."
            );
        }

        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
