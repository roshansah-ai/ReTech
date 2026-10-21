
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';
import { CompareService } from '../../services/compare';
import { CustomerAuthService } from '../../services/customer-auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private compareService = inject(CompareService);

  private authService = inject(CustomerAuthService);
  private router = inject(Router);

  cartCount = this.cartService.cartCount;
  wishlistCount = this.wishlistService.wishlistCount;
  compareCount = this.compareService.compareCount;

  currentCustomer = this.authService.currentCustomer;

  checkingSession = true;
  loggingOut = false;
  logoutError = '';

  ngOnInit(): void {
    this.authService.restoreSession().subscribe({
      next: () => {
        this.checkingSession = false;
      },
      error: () => {
        this.checkingSession = false;
      }
    });
  }

  logout(): void {

    if (this.loggingOut) {
      return;
    }

    this.loggingOut = true;
    this.logoutError = '';

    this.authService.logout().subscribe({

      next: () => {
        this.loggingOut = false;
        this.router.navigateByUrl('/');
      },

      error: () => {
        this.loggingOut = false;
        this.logoutError = 'Logout failed. Please try again.';
      }

    });
  }
}
