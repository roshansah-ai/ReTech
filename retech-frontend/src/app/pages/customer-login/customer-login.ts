
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerAuthService } from '../../services/customer-auth';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <a routerLink="/" class="back-link">
          ← Back to ReTech Store
        </a>

        <div class="logo">R</div>

        <h1>Welcome Back</h1>
        <p>Sign in to your ReTech customer account.</p>

        <form (ngSubmit)="login()">

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            placeholder="Enter your email"
            autocomplete="email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            placeholder="Enter your password"
            autocomplete="current-password"
            required
          />

          <div *ngIf="error" class="error">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>

        </form>

        <div class="footer">
          Don't have an account?
          <a routerLink="/register">Register Now</a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 76px);
      background: #f4f7fb;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30px 16px;
      box-sizing: border-box;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: white;
      padding: 36px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 15px 45px rgba(15, 23, 42, .08);
      box-sizing: border-box;
    }

    .back-link {
      color: #0f766e;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
    }

    .logo {
      width: 50px;
      height: 50px;
      display: grid;
      place-items: center;
      background: #0f766e;
      color: white;
      font-size: 25px;
      font-weight: 800;
      border-radius: 13px;
      margin-top: 25px;
    }

    h1 {
      margin: 22px 0 8px;
      color: #0f172a;
    }

    p {
      color: #64748b;
      font-size: 14px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 25px;
    }

    label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }

    input {
      padding: 13px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
    }

    input:focus {
      outline: 2px solid #14b8a6;
      border-color: transparent;
    }

    button {
      margin-top: 12px;
      padding: 14px;
      border: none;
      background: #0f766e;
      color: white;
      font-weight: 800;
      border-radius: 10px;
      cursor: pointer;
    }

    button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .error {
      color: #b91c1c;
      font-size: 13px;
    }

    .footer {
      text-align: center;
      margin-top: 25px;
      color: #64748b;
      font-size: 14px;
    }

    .footer a {
      color: #0f766e;
      font-weight: 700;
      text-decoration: none;
    }

    @media (max-width: 500px) {
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class CustomerLogin {

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  login(): void {

    if (!this.email.trim() || !this.password) {
      this.error = 'Enter your email and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(
      this.email.trim(),
      this.password
    ).subscribe({

      next: () => {
        this.loading = false;
        this.password = '';
        this.router.navigateByUrl('/');
      },

      error: (err: HttpErrorResponse) => {
        this.loading = false;

        if (err.status === 401) {
          this.error = 'Invalid email or password.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to Spring Boot.';
        } else {
          this.error = 'Login failed. Please try again.';
        }
      }

    });
  }
}
