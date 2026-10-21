
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/auth';

  currentCustomer = signal<Customer | null>(null);

  register(
    name: string,
    email: string,
    password: string
  ): Observable<Customer> {

    return this.http.post<Customer>(
      `${this.apiUrl}/register`,
      { name, email, password },
      { withCredentials: true }
    );
  }

  login(
    email: string,
    password: string
  ): Observable<Customer> {

    return this.http.post<Customer>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(customer => this.currentCustomer.set(customer))
    );
  }

  getCurrentCustomer(): Observable<Customer> {

    return this.http.get<Customer>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    ).pipe(
      tap(customer => this.currentCustomer.set(customer))
    );
  }

  restoreSession(): Observable<Customer | null> {

    return this.getCurrentCustomer().pipe(
      catchError(() => {
        this.currentCustomer.set(null);
        return of(null);
      })
    );
  }

  logout(): Observable<{ message: string }> {

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.currentCustomer.set(null))
    );
  }
}
