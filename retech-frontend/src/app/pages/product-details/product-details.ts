
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { CompareService } from '../../services/compare';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal('');
  message = signal('');
  imageFailed = signal(false);

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('Invalid product ID.');
      this.loading.set(false);
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.imageFailed.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'Product not found or server unavailable.'
        );
        this.loading.set(false);
      }
    });
  }

  // ADD PRODUCT TO CART
  addToCart(): void {
    const currentProduct = this.product();

    if (!currentProduct) return;

    const added = this.cartService.addToCart(currentProduct);

    this.message.set(
      added
        ? 'Product added to cart successfully!'
        : 'Cannot add more units. Stock limit reached.'
    );
  }

  // ADD OR REMOVE PRODUCT FROM WISHLIST
  toggleWishlist(): void {
    const currentProduct = this.product();

    if (!currentProduct) return;

    const wasSaved = this.wishlistService.isInWishlist(
      currentProduct.id
    );

    this.wishlistService.toggleWishlist(currentProduct);

    this.message.set(
      wasSaved
        ? 'Product removed from wishlist.'
        : 'Product added to wishlist!'
    );
  }

  // ADD OR REMOVE PRODUCT FROM COMPARISON
  toggleCompare(): void {
    const currentProduct = this.product();

    if (!currentProduct) return;

    const wasSelected = this.compareService.isSelected(
      currentProduct.id
    );

    const success = this.compareService.toggleProduct(
      currentProduct
    );

    if (!success) {
      this.message.set(
        'You can compare a maximum of 3 products. Remove one before adding another.'
      );
      return;
    }

    this.message.set(
      wasSelected
        ? 'Product removed from comparison.'
        : 'Product added to comparison!'
    );
  }

  // CONDITION GRADE DESCRIPTION
  getGradeDescription(grade: string): string {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'Excellent condition with minimal signs of use.';

      case 'B':
        return 'Good condition with minor cosmetic wear.';

      case 'C':
        return 'Fair condition with visible signs of previous use.';

      default:
        return 'Condition information unavailable.';
    }
  }

  // CONDITION GRADE LABEL
  getGradeLabel(grade: string): string {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'Excellent';

      case 'B':
        return 'Good';

      case 'C':
        return 'Fair';

      default:
        return 'Unrated';
    }
  }
}
