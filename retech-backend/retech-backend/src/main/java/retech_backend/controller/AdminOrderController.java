
package retech_backend.controller;

import org.springframework.web.bind.annotation.*;

import retech_backend.dto.OrderResponse;
import retech_backend.service.OrderService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET ALL ORDERS
    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    // GET ORDER BY ID
    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // UPDATE ORDER STATUS
    @PatchMapping("/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        return orderService.updateOrderStatus(
                id,
                request.get("status")
        );
    }
}
