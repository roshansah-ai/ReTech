
package retech_backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import retech_backend.entity.Customer;

public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);
}
