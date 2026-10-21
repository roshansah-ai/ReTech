
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminDashboardResponse } from '../models/admin-dashboard';
import { OrderResponse } from '../models/order';
import { Product } from '../models/product';

export type ProductInput = Omit<Product, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/admin';
  private productApiUrl = 'http://localhost:8080/api/products';

  private getAuthHeaders(username: string, password: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${username}:${password}`)
    });
  }

  getDashboard(username: string, password: string): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(
      `${this.apiUrl}/dashboard`,
      { headers: this.getAuthHeaders(username, password) }
    );
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productApiUrl);
  }

  addProduct(product: ProductInput, username: string, password: string): Observable<Product> {
    return this.http.post<Product>(this.productApiUrl, product, {
      headers: this.getAuthHeaders(username, password)
    });
  }

  updateProduct(id: number, product: ProductInput, username: string, password: string): Observable<Product> {
    return this.http.put<Product>(`${this.productApiUrl}/${id}`, product, {
      headers: this.getAuthHeaders(username, password)
    });
  }

  deleteProduct(id: number, username: string, password: string): Observable<void> {
    return this.http.delete<void>(`${this.productApiUrl}/${id}`, {
      headers: this.getAuthHeaders(username, password)
    });
  }

  // ADMIN ORDER MANAGEMENT

  getOrders(username: string, password: string): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(
      `${this.apiUrl}/orders`,
      { headers: this.getAuthHeaders(username, password) }
    );
  }

  getOrderById(id: number, username: string, password: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(
      `${this.apiUrl}/orders/${id}`,
      { headers: this.getAuthHeaders(username, password) }
    );
  }

  updateOrderStatus(
    id: number,
    status: string,
    username: string,
    password: string
  ): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${this.apiUrl}/orders/${id}/status`,
      { status },
      { headers: this.getAuthHeaders(username, password) }
    );
  }
}
