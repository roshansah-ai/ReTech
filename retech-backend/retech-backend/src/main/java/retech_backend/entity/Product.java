
package retech_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Brand is required")
    private String brand;

    @Column(length = 2000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Min(0)
    private int stock;

    private String category;

    @Pattern(regexp = "A|B|C", message = "Grade must be A, B or C")
    private String conditionGrade;

    private String imageUrl;

    @Min(0)
    private int warrantyMonths;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getDescription() { return description; }
    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getCategory() { return category; }
    public void setCategory(String category) {
        this.category = category;
    }

    public String getConditionGrade() { return conditionGrade; }
    public void setConditionGrade(String conditionGrade) {
        this.conditionGrade = conditionGrade;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(int warrantyMonths) {
        this.warrantyMonths = warrantyMonths;
    }
}
