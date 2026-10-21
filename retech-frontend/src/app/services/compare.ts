
import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  private readonly storageKey = 'retech_compare';
  readonly maxProducts = 3;

  private readonly selectedProducts = signal<Product[]>(
    this.loadProducts()
  );

  readonly products = this.selectedProducts.asReadonly();

  readonly compareCount = computed(
    () => this.selectedProducts().length
  );

  isSelected(productId: number): boolean {
    return this.selectedProducts().some(
      product => product.id === productId
    );
  }

  addProduct(product: Product): boolean {
    if (this.isSelected(product.id)) {
      return true;
    }

    if (this.selectedProducts().length >= this.maxProducts) {
      return false;
    }

    this.selectedProducts.update(products => [
      ...products,
      product
    ]);

    this.saveProducts();
    return true;
  }

  removeProduct(productId: number): void {
    this.selectedProducts.update(products =>
      products.filter(product => product.id !== productId)
    );

    this.saveProducts();
  }

  toggleProduct(product: Product): boolean {
    if (this.isSelected(product.id)) {
      this.removeProduct(product.id);
      return true;
    }

    return this.addProduct(product);
  }

  clearComparison(): void {
    this.selectedProducts.set([]);
    this.saveProducts();
  }

  private saveProducts(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.selectedProducts())
      );
    }
  }

  private loadProducts(): Product[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) return [];

      const validProducts = parsed.filter(
        (product): product is Product =>
          product !== null &&
          typeof product === 'object' &&
          Number.isInteger(product.id) &&
          typeof product.name === 'string' &&
          typeof product.brand === 'string' &&
          typeof product.description === 'string' &&
          Number.isFinite(product.price) &&
          Number.isInteger(product.stock) &&
          typeof product.category === 'string' &&
          ['A', 'B', 'C'].includes(product.conditionGrade) &&
          typeof product.imageUrl === 'string' &&
          Number.isInteger(product.warrantyMonths)
      );

      return validProducts
        .filter(
          (product, index, products) =>
            products.findIndex(
              item => item.id === product.id
            ) === index
        )
        .slice(0, this.maxProducts);

    } catch {
      return [];
    }
  }
}
