
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { CheckoutRequest, OrderResponse } from '../../models/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout {

  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly cartCount = this.cartService.cartCount;

  readonly submitting = signal(false);
  readonly error = signal('');
  readonly completedOrder = signal<OrderResponse | null>(null);

  customerName = '';
  email = '';
  phone = '';
  deliveryAddress = '';
  paymentMethod: 'COD' | 'SIMULATED_ONLINE' = 'COD';

  placeOrder(form: NgForm): void {
    if (
      form.invalid ||
      this.items().length === 0 ||
      this.submitting() ||
      this.completedOrder()
    ) {
      form.control.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.submitting.set(true);

    const request: CheckoutRequest = {
      customerName: this.customerName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      deliveryAddress: this.deliveryAddress.trim(),
      paymentMethod: this.paymentMethod,
      items: this.items().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    this.orderService.placeOrder(request).subscribe({
      next: (order) => {
        this.completedOrder.set(order);
        this.cartService.clearCart();
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Checkout failed:', err);

        if (err.status === 409) {
          this.error.set(
            'Some products are no longer available in the requested quantity. Please review your cart.'
          );
        } else if (err.status === 400) {
          this.error.set(
            'Please check your delivery details and cart items.'
          );
        } else if (err.status === 0) {
          this.error.set(
            'Cannot connect to Spring Boot. Make sure the backend is running on port 8080.'
          );
        } else {
          this.error.set(
            'Unable to place your order. Please try again.'
          );
        }

        this.submitting.set(false);
      }
    });
  }
}
