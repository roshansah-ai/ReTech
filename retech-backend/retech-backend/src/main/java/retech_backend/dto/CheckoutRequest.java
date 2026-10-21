
package retech_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CheckoutRequest(

        @NotBlank
        @Size(max = 100)
        String customerName,

        @NotBlank
        @Email
        String email,

        @NotBlank
        @Pattern(regexp = "^[0-9+() -]{7,20}$")
        String phone,

        @NotBlank
        @Size(max = 1000)
        String deliveryAddress,

        @NotBlank
        String paymentMethod,

        @NotEmpty
        List<@Valid CheckoutItemRequest> items

) {}
