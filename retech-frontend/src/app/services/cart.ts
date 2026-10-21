
import { Injectable, computed, signal } from '@angular/core';

import { Product } from '../models/product';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly storageKey = 'retech_cart';

  private readonly cartItems = signal<CartItem[]>(
    this.loadCart()
  );

  readonly items = this.cartItems.asReadonly();

  readonly cartCount = computed(() =>
    this.cartItems().reduce(
      (total, item) => total + item.quantity,
      0
    )
  );

  readonly subtotal = computed(() =>
    this.cartItems().reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    )
  );

  addToCart(product: Product): boolean {
    if (product.stock <= 0) {
      return false;
    }

    const currentItems = this.cartItems();
    const existingItem = currentItems.find(
      item => item.product.id === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return false;
      }

      this.cartItems.set(
        currentItems.map(item =>
          item.product.id === product.id
            ? {
                product,
                quantity: item.quantity + 1
              }
            : item
        )
      );
    } else {
      this.cartItems.set([
        ...currentItems,
        {
          product,
          quantity: 1
        }
      ]);
    }

    this.saveCart();
    return true;
  }

  increaseQuantity(productId: number): void {
    this.cartItems.update(items =>
      items.map(item => {
        if (
          item.product.id === productId &&
          item.quantity < item.product.stock
        ) {
          return {
            ...item,
            quantity: item.quantity + 1
          };
        }

        return item;
      })
    );

    this.saveCart();
  }

  decreaseQuantity(productId: number): void {
    this.cartItems.update(items =>
      items.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: Math.max(1, item.quantity - 1)
          };
        }

        return item;
      })
    );

    this.saveCart();
  }

  removeFromCart(productId: number): void {
    this.cartItems.update(items =>
      items.filter(
        item => item.product.id !== productId
      )
    );

    this.saveCart();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCart();
  }

  private saveCart(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.cartItems())
      );
    }
  }

  private loadCart(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const saved = localStorage.getItem(this.storageKey);

      if (!saved) {
        return [];
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item): item is CartItem =>
        item !== null &&
        typeof item === 'object' &&
        item.product !== null &&
        typeof item.product === 'object' &&
        Number.isInteger(item.product.id) &&
        Number.isFinite(item.product.price) &&
        Number.isInteger(item.product.stock) &&
        item.product.stock > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      ).map(item => ({
        ...item,
        quantity: Math.min(
          item.quantity,
          item.product.stock
        )
      }));

    } catch {
      return [];
    }
  }
}
