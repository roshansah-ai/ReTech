
import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private readonly storageKey = 'retech_wishlist';

  private readonly wishlistProducts = signal<Product[]>(
    this.loadWishlist()
  );

  readonly products = this.wishlistProducts.asReadonly();

  readonly wishlistCount = computed(
    () => this.wishlistProducts().length
  );

  isInWishlist(productId: number): boolean {
    return this.wishlistProducts().some(
      product => product.id === productId
    );
  }

  addToWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      return;
    }

    this.wishlistProducts.update(products => [
      ...products,
      product
    ]);

    this.saveWishlist();
  }

  removeFromWishlist(productId: number): void {
    this.wishlistProducts.update(products =>
      products.filter(product => product.id !== productId)
    );

    this.saveWishlist();
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }

  clearWishlist(): void {
    this.wishlistProducts.set([]);
    this.saveWishlist();
  }

  private saveWishlist(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.wishlistProducts())
      );
    }
  }

  private loadWishlist(): Product[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (product): product is Product =>
          product !== null &&
          typeof product === 'object' &&
          Number.isInteger(product.id) &&
          typeof product.name === 'string' &&
          typeof product.brand === 'string' &&
          typeof product.category === 'string' &&
          typeof product.imageUrl === 'string' &&
          Number.isFinite(product.price) &&
          Number.isInteger(product.stock)
      );
    } catch {
      return [];
    }
  }
}
