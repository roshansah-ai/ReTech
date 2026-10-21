
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { OrderService } from '../../services/order';
import { CustomerAuthService } from '../../services/customer-auth';
import { OrderResponse } from '../../models/order';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css'
})
export class MyOrders implements OnInit {

  private orderService = inject(OrderService);
  private authService = inject(CustomerAuthService);

  currentCustomer = this.authService.currentCustomer;

  email = '';

  orders = signal<OrderResponse[]>([]);
  loading = signal(false);
  searched = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loading.set(true);

    this.authService.getCurrentCustomer().subscribe({
      next: (customer) => {
        this.email = customer.email;
        this.searchOrders();
      },
      error: () => {
        this.loading.set(false);
        this.orders.set([]);
        this.error.set(
          'Please log in to view your orders.'
        );
      }
    });
  }

  searchOrders(): void {

    const customer = this.currentCustomer();

    if (!customer) {
      this.error.set('Please log in to view your orders.');
      this.orders.set([]);
      return;
    }

    this.email = customer.email;

    this.loading.set(true);
    this.searched.set(false);
    this.error.set('');
    this.orders.set([]);

    this.orderService.getOrdersByEmail().subscribe({

      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
        this.searched.set(true);
      },

      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        if (err.status === 401 || err.status === 403) {
          this.error.set(
            'Your session has expired. Please log in again.'
          );
        } else if (err.status === 0) {
          this.error.set(
            'Cannot connect to the backend. Check Spring Boot.'
          );
        } else {
          this.error.set('Unable to load your orders.');
        }
      }

    });
  }

  getStatusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  getTrackingStep(status: string): number {

    switch (status.toUpperCase()) {

      case 'PLACED':
        return 1;

      case 'CONFIRMED':
      case 'PROCESSING':
        return 2;

      case 'SHIPPED':
        return 3;

      case 'DELIVERED':
        return 4;

      default:
        return 0;
    }
  }

  trackOrder(index: number, order: OrderResponse): number {
    return order.orderId;
  }
}
