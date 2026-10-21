
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CompareService } from '../../services/compare';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { Product } from '../../models/product';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './compare.html',
  styleUrl: './compare.css'
})
export class Compare {

  readonly compareService = inject(CompareService);
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  readonly products = this.compareService.products;
  readonly compareCount = this.compareService.compareCount;

  readonly message = signal('');

  removeProduct(id: number): void {
    this.compareService.removeProduct(id);
    this.message.set('Product removed from comparison.');
  }

  clearComparison(): void {
    this.compareService.clearComparison();
    this.message.set('Comparison cleared.');
  }

  addToCart(product: Product): void {
    const added = this.cartService.addToCart(product);

    this.message.set(
      added
        ? `${product.name} added to cart!`
        : 'Unable to add product. Stock limit reached.'
    );
  }

  toggleWishlist(product: Product): void {
    const wasSelected = this.wishlistService.isInWishlist(
      product.id
    );

    this.wishlistService.toggleWishlist(product);

    this.message.set(
      wasSelected
        ? 'Product removed from wishlist.'
        : 'Product added to wishlist!'
    );
  }

  getGradeLabel(grade: string): string {
    switch (grade?.toUpperCase()) {
      case 'A': return 'Excellent';
      case 'B': return 'Good';
      case 'C': return 'Fair';
      default: return 'Unrated';
    }
  }

  getLowestPrice(): number {
    const products = this.products();

    return products.length
      ? Math.min(...products.map(product => product.price))
      : 0;
  }

  getLongestWarranty(): number {
    const products = this.products();

    return products.length
      ? Math.max(
          ...products.map(product => product.warrantyMonths)
        )
      : 0;
  }
}
