
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CheckoutRequest,
  OrderResponse
} from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/orders';

  placeOrder(request: CheckoutRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(
      this.apiUrl,
      request,
      { withCredentials: true }
    );
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  getOrdersByEmail(_email?: string): Observable<OrderResponse[]> {
    // Backend uses the authenticated customer's email.
    // The supplied email is intentionally ignored.
    return this.http.get<OrderResponse[]>(
      `${this.apiUrl}/history`,
      { withCredentials: true }
    );
  }
}
