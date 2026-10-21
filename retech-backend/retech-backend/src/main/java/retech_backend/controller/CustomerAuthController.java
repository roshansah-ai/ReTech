
package retech_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import retech_backend.entity.Customer;
import retech_backend.repository.CustomerRepository;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class CustomerAuthController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    private final HttpSessionSecurityContextRepository contextRepository =
            new HttpSessionSecurityContextRepository();

    public CustomerAuthController(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterRequest(
            String name,
            String email,
            String password
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record CustomerResponse(
            Long id,
            String name,
            String email
    ) {}

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail()
        );
    }

    private String normalizeEmail(String email) {
        return email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {
        String name = request.name() == null
                ? ""
                : request.name().trim();

        String email = normalizeEmail(request.email());
        String password = request.password();

        if (name.length() < 2 || name.length() > 100) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Name must contain 2 to 100 characters.")
            );
        }

        if (email.length() > 255 ||
                !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Enter a valid email address.")
            );
        }

        if (password == null ||
                password.length() < 8 ||
                password.length() > 72) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Password must contain 8 to 72 characters.")
            );
        }

        if (customerRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Email is already registered.")
            );
        }

        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(password));

        try {
            Customer saved = customerRepository.save(customer);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(toResponse(saved));

        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of("message", "Email is already registered.")
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        String email = normalizeEmail(request.email());

        Optional<Customer> found =
                customerRepository.findByEmail(email);

        if (found.isEmpty() ||
                request.password() == null ||
                !passwordEncoder.matches(
                        request.password(),
                        found.get().getPassword()
                )) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password.")
            );
        }

        Customer customer = found.get();

        // Prevent session fixation on successful login.
        if (httpRequest.getSession(false) != null) {
            httpRequest.changeSessionId();
        }

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        customer.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                );

        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        contextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        return ResponseEntity.ok(toResponse(customer));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentCustomer(
            Authentication authentication
    ) {
        if (authentication == null ||
                authentication.getAuthorities().stream()
                        .noneMatch(a ->
                                a.getAuthority().equals("ROLE_CUSTOMER"))) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not signed in."));
        }

        return customerRepository
                .findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(
                        customer -> ResponseEntity.ok(toResponse(customer))
                )
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Customer not found."))
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {

        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully.")
        );
    }
}
