
package retech_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import retech_backend.dto.AdminDashboardResponse;
import retech_backend.dto.OrderItemResponse;
import retech_backend.dto.OrderResponse;
import retech_backend.entity.Order;
import retech_backend.repository.OrderRepository;
import retech_backend.repository.ProductRepository;

import java.util.List;

@Service
public class AdminDashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminDashboardService(
            ProductRepository productRepository,
            OrderRepository orderRepository
    ) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {

        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalCustomers = orderRepository.countDistinctCustomers();

        List<OrderResponse> recentOrders = orderRepository
                .findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();

        return new AdminDashboardResponse(
                totalProducts,
                totalOrders,
                orderRepository.calculateTotalRevenue(),
                totalCustomers,
                recentOrders
        );
    }

    private OrderResponse toResponse(Order order) {

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getEmail(),
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getOrderStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items
        );
    }
}
