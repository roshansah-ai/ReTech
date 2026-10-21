
package retech_backend.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import retech_backend.dto.CheckoutRequest;
import retech_backend.dto.OrderResponse;
import retech_backend.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(
            @Valid @RequestBody CheckoutRequest request
    ) {
        return orderService.placeOrder(request);
    }

    @GetMapping("/history")
    public List<OrderResponse> getOrderHistory(
            Authentication authentication
    ) {
        requireCustomer(authentication);

        return orderService.getOrdersByEmail(
                authentication.getName()
        );
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null ||
                !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in."
            );
        }

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(a ->
                        a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return orderService.getOrderById(id);
        }

        requireCustomer(authentication);

        return orderService.getOrderByIdForCustomer(
                id,
                authentication.getName()
        );
    }

    private void requireCustomer(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream()
                        .noneMatch(a ->
                                a.getAuthority().equals("ROLE_CUSTOMER"))) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Customer login required."
            );
        }
    }
}
