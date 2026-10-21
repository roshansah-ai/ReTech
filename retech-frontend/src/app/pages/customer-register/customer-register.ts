
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerAuthService } from '../../services/customer-auth';

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <a routerLink="/" class="back-link">
          ← Back to ReTech Store
        </a>

        <div class="logo">R</div>

        <h1>Create Account</h1>
        <p>Join ReTech and start shopping.</p>

        <form (ngSubmit)="register()">

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            placeholder="Enter your full name"
            autocomplete="name"
            minlength="2"
            maxlength="100"
            required
          />

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
            placeholder="Minimum 8 characters"
            autocomplete="new-password"
            minlength="8"
            maxlength="72"
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            [(ngModel)]="confirmPassword"
            placeholder="Re-enter your password"
            autocomplete="new-password"
            required
          />

          <div *ngIf="error" class="error">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

        </form>

        <div class="footer">
          Already have an account?
          <a routerLink="/login">Login</a>
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
export class CustomerRegister {

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  error = '';
  loading = false;

  register(): void {

    this.error = '';

    if (this.name.trim().length < 2) {
      this.error = 'Enter your full name.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.error = 'Enter a valid email address.';
      return;
    }

    if (this.password.length < 8 || this.password.length > 72) {
      this.error = 'Password must contain 8 to 72 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.authService.register(
      this.name.trim(),
      this.email.trim(),
      this.password
    ).subscribe({

      next: () => {
        this.loading = false;
        this.password = '';
        this.confirmPassword = '';

        // Registration does not automatically sign the user in.
        this.router.navigateByUrl('/login');
      },

      error: (err: HttpErrorResponse) => {
        this.loading = false;

        if (err.status === 409) {
          this.error = 'This email is already registered.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to Spring Boot.';
        } else if (err.status === 400) {
          this.error = err.error?.message || 'Invalid registration details.';
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }

    });
  }
}
