
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { WishlistService } from '../../services/wishlist';
import { CartService } from '../../services/cart';
import { Product } from '../../models/product';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist {

  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  readonly products = this.wishlistService.products;
  readonly wishlistCount = this.wishlistService.wishlistCount;

  readonly message = signal('');

  removeProduct(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
    this.message.set('Product removed from wishlist.');
  }

  addToCart(product: Product): void {
    const added = this.cartService.addToCart(product);

    this.message.set(
      added
        ? `${product.name} added to cart!`
        : 'Cannot add product. Stock limit reached.'
    );
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
    this.message.set('Wishlist cleared.');
  }
}
