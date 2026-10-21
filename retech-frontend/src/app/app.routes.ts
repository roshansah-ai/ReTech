
import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { ProductDetails } from './pages/product-details/product-details';
import { Cart } from './pages/cart/cart';
import { Wishlist } from './pages/wishlist/wishlist';
import { Compare } from './pages/compare/compare';
import { Checkout } from './pages/checkout/checkout';
import { MyOrders } from './pages/my-orders/my-orders';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';

import { CustomerLogin } from './pages/customer-login/customer-login';
import { CustomerRegister } from './pages/customer-register/customer-register';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },

  { path: 'login', component: CustomerLogin },
  { path: 'register', component: CustomerRegister },

  { path: 'products/:id', component: ProductDetails },
  { path: 'cart', component: Cart },
  { path: 'wishlist', component: Wishlist },
  { path: 'compare', component: Compare },
  { path: 'checkout', component: Checkout },
  { path: 'my-orders', component: MyOrders },

  { path: 'admin', component: AdminDashboard },

  { path: '**', redirectTo: '' }
];
