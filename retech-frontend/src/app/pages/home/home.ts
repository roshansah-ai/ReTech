
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { CompareService } from '../../services/compare';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private productService = inject(ProductService);

  // PRODUCT COMPARISON
  readonly compareService = inject(CompareService);
  readonly compareCount = this.compareService.compareCount;

  // PRODUCT DATA
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);

  // SEARCH AND FILTERS
  searchTerm = '';
  selectedCategory = 'All';
  sortBy = 'default';

  // PAGE STATUS
  loading = signal(true);
  error = signal('');
  compareMessage = signal('');

  categories = [
    'All',
    'Laptops',
    'Smartphones',
    'Tablets',
    'Accessories'
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  // LOAD PRODUCTS FROM SPRING BOOT
  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Product API error:', err);

        this.error.set(
          'Unable to load products. Check Spring Boot and CORS.'
        );

        this.loading.set(false);
      }
    });
  }

  // SEARCH, CATEGORY FILTER AND SORTING
  applyFilters(): void {
    const search = this.searchTerm.toLowerCase().trim();

    const filtered = this.products().filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        product.category?.toLowerCase() ===
          this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (this.sortBy === 'low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    this.filteredProducts.set(filtered);
  }

  // SELECT PRODUCT CATEGORY
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // ADD OR REMOVE PRODUCT FROM COMPARISON
  toggleCompare(product: Product): void {

    const wasSelected = this.compareService.isSelected(
      product.id
    );

    const success = this.compareService.toggleProduct(
      product
    );

    if (!success) {
      this.compareMessage.set(
        'You can compare a maximum of 3 products. Remove one before adding another.'
      );
      return;
    }

    this.compareMessage.set(
      wasSelected
        ? `${product.name} removed from comparison.`
        : `${product.name} added to comparison!`
    );
  }

  // CHECK WHETHER PRODUCT IS SELECTED
  isCompared(productId: number): boolean {
    return this.compareService.isSelected(productId);
  }

  // REMOVE ALL COMPARED PRODUCTS
  clearComparison(): void {
    this.compareService.clearComparison();
    this.compareMessage.set('Comparison cleared.');
  }

  // TRACK PRODUCTS FOR PERFORMANCE
  trackProduct(index: number, product: Product): number {
    return product.id;
  }
}
