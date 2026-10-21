
package retech_backend.service;

import org.springframework.stereotype.Service;
import retech_backend.entity.Product;
import retech_backend.repository.ProductRepository;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Product addProduct(Product product) {
        product.setId(null);
        return repository.save(product);
    }

    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    public Product getProductById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + id));
    }

    public List<Product> searchProducts(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getByCategory(String category) {
        return repository.findByCategoryIgnoreCase(category);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);

        existing.setName(updated.getName());
        existing.setBrand(updated.getBrand());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setStock(updated.getStock());
        existing.setCategory(updated.getCategory());
        existing.setConditionGrade(updated.getConditionGrade());
        existing.setImageUrl(updated.getImageUrl());
        existing.setWarrantyMonths(updated.getWarrantyMonths());

        return repository.save(existing);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        repository.delete(product);
    }
}
