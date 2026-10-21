
package retech_backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
        long totalProducts,
        long totalOrders,
        BigDecimal totalRevenue,
        long totalCustomers,
        List<OrderResponse> recentOrders
) {
}
