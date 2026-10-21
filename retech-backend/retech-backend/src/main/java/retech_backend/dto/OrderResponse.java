
package retech_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        String customerName,
        String email,
        String phone,
        String deliveryAddress,
        String paymentMethod,
        String paymentStatus,
        String orderStatus,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {}
