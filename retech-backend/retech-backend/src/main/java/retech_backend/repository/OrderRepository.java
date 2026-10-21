
package retech_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import retech_backend.entity.Order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Customer order history
    List<Order> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    // Recent dashboard orders
    List<Order> findTop5ByOrderByCreatedAtDesc();

    // All orders for admin
    List<Order> findAllByOrderByCreatedAtDesc();

    // Lock order while updating its status
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    // Total store revenue
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal calculateTotalRevenue();

    // Unique customers
    @Query("SELECT COUNT(DISTINCT LOWER(o.email)) FROM Order o")
    long countDistinctCustomers();
}
