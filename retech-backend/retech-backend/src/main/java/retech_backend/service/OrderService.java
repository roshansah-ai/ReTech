
package retech_backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import retech_backend.dto.CheckoutItemRequest;
import retech_backend.dto.CheckoutRequest;
import retech_backend.dto.OrderItemResponse;
import retech_backend.dto.OrderResponse;

import retech_backend.entity.Order;
import retech_backend.entity.OrderItem;
import retech_backend.entity.Product;

import retech_backend.repository.OrderRepository;
import retech_backend.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // ==============================
    // PLACE ORDER
    // ==============================

    @Transactional
    public OrderResponse placeOrder(CheckoutRequest request) {

        String paymentMethod = request.paymentMethod()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!paymentMethod.equals("COD")
                && !paymentMethod.equals("SIMULATED_ONLINE")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payment method."
            );
        }

        Map<Long, Integer> quantities = new TreeMap<>();

        for (CheckoutItemRequest item : request.items()) {

            if (item == null
                    || item.productId() == null
                    || item.productId() <= 0
                    || item.quantity() == null
                    || item.quantity() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid cart item."
                );
            }

            try {

                quantities.merge(
                        item.productId(),
                        item.quantity(),
                        Math::addExact
                );

            } catch (ArithmeticException ex) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid quantity."
                );
            }
        }

        if (quantities.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cart cannot be empty."
            );
        }

        Order order = new Order();

        order.setCustomerName(request.customerName().trim());
        order.setEmail(request.email().trim());
        order.setPhone(request.phone().trim());
        order.setDeliveryAddress(request.deliveryAddress().trim());
        order.setPaymentMethod(paymentMethod);

        order.setPaymentStatus(
                paymentMethod.equals("COD")
                        ? "PENDING"
                        : "SIMULATED_PAID"
        );

        order.setOrderStatus("PLACED");

        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {

            Long productId = entry.getKey();
            int quantity = entry.getValue();

            Product product = productRepository
                    .findByIdForUpdate(productId)
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Product not found: " + productId
                            )
                    );

            if (product.getStock() < quantity) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();

            if (unitPrice == null
                    || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Invalid product price."
                );
            }

            BigDecimal lineTotal = unitPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            OrderItem orderItem = new OrderItem();

            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setLineTotal(lineTotal);

            order.addItem(orderItem);

            product.setStock(
                    product.getStock() - quantity
            );

            total = total.add(lineTotal);
        }

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        return toResponse(savedOrder);
    }

    // ==============================
    // GET ORDER BY ID
    // ==============================

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found."
                        )
                );

        return toResponse(order);
    }

    // ==============================
    // GET ORDER FOR LOGGED-IN CUSTOMER
    // ==============================

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForCustomer(
            Long id,
            String customerEmail
    ) {

        if (customerEmail == null || customerEmail.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Customer login required."
            );
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found."
                        )
                );

        if (order.getEmail() == null
                || !order.getEmail()
                .trim()
                .equalsIgnoreCase(customerEmail.trim())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Order not found."
            );
        }

        return toResponse(order);
    }

    // ==============================
    // CUSTOMER ORDER HISTORY
    // ==============================

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required."
            );
        }

        return orderRepository
                .findByEmailIgnoreCaseOrderByCreatedAtDesc(
                        email.trim()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==============================
    // ADMIN: GET ALL ORDERS
    // ==============================

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==============================
    // ADMIN: UPDATE ORDER STATUS
    // ==============================

    @Transactional
    public OrderResponse updateOrderStatus(
            Long id,
            String newStatus
    ) {

        if (newStatus == null || newStatus.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order status is required."
            );
        }

        String status = newStatus
                .trim()
                .toUpperCase(Locale.ROOT);

        Order order = orderRepository
                .findByIdForUpdate(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found."
                        )
                );

        String currentStatus = order.getOrderStatus();

        if (currentStatus.equals(status)) {
            return toResponse(order);
        }

        if (currentStatus.equals("CANCELLED")
                || currentStatus.equals("DELIVERED")) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This order cannot be modified."
            );
        }

        boolean validTransition = switch (currentStatus) {

            case "PLACED" ->
                    status.equals("CONFIRMED")
                            || status.equals("CANCELLED");

            case "CONFIRMED" ->
                    status.equals("SHIPPED")
                            || status.equals("CANCELLED");

            case "SHIPPED" ->
                    status.equals("DELIVERED");

            default -> false;
        };

        if (!validTransition) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid order status transition."
            );
        }

        // RESTORE PRODUCT STOCK WHEN CANCELLED

        if (status.equals("CANCELLED")) {

            for (OrderItem item : order.getItems()) {

                Product product = productRepository
                        .findByIdForUpdate(item.getProductId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Cannot restore stock: product not found."
                                )
                        );

                try {

                    product.setStock(
                            Math.addExact(
                                    product.getStock(),
                                    item.getQuantity()
                            )
                    );

                } catch (ArithmeticException ex) {

                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Cannot restore stock: quantity overflow."
                    );
                }
            }
        }

        order.setOrderStatus(status);

        return toResponse(
                orderRepository.save(order)
        );
    }

    // ==============================
    // CONVERT ORDER ENTITY TO RESPONSE
    // ==============================

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
