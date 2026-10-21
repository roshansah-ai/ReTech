
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminService, ProductInput } from '../../services/admin';
import { AdminDashboardResponse } from '../../models/admin-dashboard';
import { OrderResponse } from '../../models/order';
import { Product } from '../../models/product';

type AdminSection = 'overview' | 'products' | 'orders' | 'analytics';

interface CategoryAnalytics {
  category: string;
  products: number;
  units: number;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {
  private adminService = inject(AdminService);

  username = 'admin';
  password = '';

  private sessionUsername = '';
  private sessionPassword = '';

  dashboard = signal<AdminDashboardResponse | null>(null);
  loading = signal(false);
  error = signal('');

  activeSection = signal<AdminSection>('overview');

  // PRODUCT MANAGEMENT
  products = signal<Product[]>([]);
  productsLoading = signal(false);
  productSaving = signal(false);
  productError = signal('');
  productMessage = signal('');

  showProductForm = signal(false);
  editingProductId = signal<number | null>(null);

  searchTerm = '';
  categoryFilter = '';
  productForm: ProductInput = this.emptyProduct();

  // ORDER MANAGEMENT
  orders = signal<OrderResponse[]>([]);
  ordersLoading = signal(false);
  orderError = signal('');
  orderMessage = signal('');

  selectedOrder = signal<OrderResponse | null>(null);
  orderSavingId = signal<number | null>(null);

  orderSearch = '';
  orderStatusFilter = '';

  // INVENTORY ANALYTICS
  lowStockThreshold = 5;
  analyticsSearch = '';
  analyticsFilter = 'all';

  private emptyProduct(): ProductInput {
    return {
      name: '',
      brand: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      conditionGrade: 'A',
      imageUrl: '',
      warrantyMonths: 0
    };
  }

  // LOGIN

  login(): void {
    if (!this.username.trim() || !this.password) {
      this.error.set('Enter your admin username and password.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const username = this.username.trim();
    const password = this.password;

    this.adminService.getDashboard(username, password).subscribe({
      next: data => {
        this.sessionUsername = username;
        this.sessionPassword = password;
        this.dashboard.set(data);
        this.password = '';
        this.loading.set(false);
        this.loadProducts();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        if (err.status === 401) {
          this.error.set('Invalid admin username or password.');
        } else if (err.status === 403) {
          this.error.set('You do not have admin access.');
        } else if (err.status === 0) {
          this.error.set('Cannot connect to Spring Boot.');
        } else {
          this.error.set('Unable to load dashboard statistics.');
        }
      }
    });
  }

  logout(): void {
    this.dashboard.set(null);
    this.sessionUsername = '';
    this.sessionPassword = '';
    this.password = '';
    this.error.set('');

    this.products.set([]);
    this.productError.set('');
    this.productMessage.set('');
    this.productSaving.set(false);

    this.orders.set([]);
    this.orderError.set('');
    this.orderMessage.set('');
    this.selectedOrder.set(null);
    this.orderSavingId.set(null);

    this.activeSection.set('overview');
    this.showProductForm.set(false);
    this.editingProductId.set(null);
    this.productForm = this.emptyProduct();

    this.searchTerm = '';
    this.categoryFilter = '';
    this.orderSearch = '';
    this.orderStatusFilter = '';
    this.analyticsSearch = '';
    this.analyticsFilter = 'all';
  }

  // PRODUCT MANAGEMENT

  loadProducts(): void {
    this.productsLoading.set(true);
    this.productError.set('');

    this.adminService.getProducts().subscribe({
      next: products => {
        this.products.set(products);
        this.productsLoading.set(false);
      },
      error: () => {
        this.productsLoading.set(false);
        this.productError.set('Unable to load products.');
      }
    });
  }

  openProducts(): void {
    this.activeSection.set('products');
    this.loadProducts();
  }

  openAddProduct(): void {
    this.editingProductId.set(null);
    this.productForm = this.emptyProduct();
    this.productError.set('');
    this.productMessage.set('');
    this.showProductForm.set(true);
  }

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);

    this.productForm = {
      name: product.name,
      brand: product.brand,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      category: product.category ?? '',
      conditionGrade: product.conditionGrade,
      imageUrl: product.imageUrl ?? '',
      warrantyMonths: product.warrantyMonths
    };

    this.productError.set('');
    this.productMessage.set('');
    this.showProductForm.set(true);
  }

  cancelProductForm(): void {
    this.showProductForm.set(false);
    this.editingProductId.set(null);
    this.productForm = this.emptyProduct();
  }

  get filteredProducts(): Product[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.products().filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search);

      const matchesCategory =
        !this.categoryFilter ||
        product.category === this.categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }

  get categories(): string[] {
    return [...new Set(
      this.products()
        .map(product => product.category)
        .filter((category): category is string => !!category)
    )].sort();
  }

  saveProduct(): void {
    if (this.productSaving()) return;

    const product: ProductInput = {
      ...this.productForm,
      name: this.productForm.name.trim(),
      brand: this.productForm.brand.trim(),
      description: this.productForm.description?.trim() ?? '',
      category: this.productForm.category?.trim() ?? '',
      imageUrl: this.productForm.imageUrl?.trim() ?? '',
      price: Number(this.productForm.price),
      stock: Number(this.productForm.stock),
      warrantyMonths: Number(this.productForm.warrantyMonths)
    };

    if (
      !product.name ||
      !product.brand ||
      !Number.isFinite(product.price) ||
      product.price < 0.01 ||
      !Number.isInteger(product.stock) ||
      product.stock < 0 ||
      !Number.isInteger(product.warrantyMonths) ||
      product.warrantyMonths < 0 ||
      !['A', 'B', 'C'].includes(product.conditionGrade)
    ) {
      this.productError.set('Please enter valid product details.');
      return;
    }

    this.productSaving.set(true);
    this.productError.set('');
    this.productMessage.set('');

    const id = this.editingProductId();

    const request = id === null
      ? this.adminService.addProduct(
          product,
          this.sessionUsername,
          this.sessionPassword
        )
      : this.adminService.updateProduct(
          id,
          product,
          this.sessionUsername,
          this.sessionPassword
        );

    request.subscribe({
      next: () => {
        this.productSaving.set(false);
        this.cancelProductForm();

        this.productMessage.set(
          id === null
            ? 'Product added successfully.'
            : 'Product updated successfully.'
        );

        this.loadProducts();
        this.refreshDashboard();
      },
      error: (err: HttpErrorResponse) => {
        this.productSaving.set(false);
        this.productError.set(this.productRequestError(err));
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    this.productError.set('');
    this.productMessage.set('');

    this.adminService.deleteProduct(
      product.id,
      this.sessionUsername,
      this.sessionPassword
    ).subscribe({
      next: () => {
        this.productMessage.set('Product deleted successfully.');
        this.loadProducts();
        this.refreshDashboard();
      },
      error: (err: HttpErrorResponse) => {
        this.productError.set(this.productRequestError(err));
      }
    });
  }

  private productRequestError(err: HttpErrorResponse): string {
    if (err.status === 401 || err.status === 403) {
      return 'Admin authentication failed. Please sign out and sign in again.';
    }
    if (err.status === 0) {
      return 'Cannot connect to Spring Boot.';
    }
    if (err.status === 400) {
      return 'Invalid product details. Check the fields and try again.';
    }
    if (err.status === 409) {
      return 'This product cannot be deleted because it is referenced by existing records.';
    }
    return 'Product operation failed. Please try again.';
  }

  // ORDER MANAGEMENT

  openOrders(): void {
    this.activeSection.set('orders');
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersLoading.set(true);
    this.orderError.set('');

    this.adminService.getOrders(
      this.sessionUsername,
      this.sessionPassword
    ).subscribe({
      next: orders => {
        this.orders.set(orders);
        this.ordersLoading.set(false);

        const selected = this.selectedOrder();

        if (selected) {
          this.selectedOrder.set(
            orders.find(o => o.orderId === selected.orderId) ?? null
          );
        }
      },
      error: (err: HttpErrorResponse) => {
        this.ordersLoading.set(false);
        this.orderError.set(this.orderRequestError(err));
      }
    });
  }

  get filteredOrders(): OrderResponse[] {
    const search = this.orderSearch.trim().toLowerCase();

    return this.orders().filter(order => {
      const matchesText =
        !search ||
        String(order.orderId).includes(search.replace('#rt-', '')) ||
        order.customerName.toLowerCase().includes(search) ||
        order.email.toLowerCase().includes(search);

      const matchesStatus =
        !this.orderStatusFilter ||
        order.orderStatus === this.orderStatusFilter;

      return matchesText && matchesStatus;
    });
  }

  viewOrder(order: OrderResponse): void {
    this.selectedOrder.set(order);
  }

  closeOrder(): void {
    this.selectedOrder.set(null);
  }

  nextStatuses(status: string): string[] {
    switch (status) {
      case 'PLACED':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      default:
        return [];
    }
  }

  updateOrderStatus(order: OrderResponse, status: string): void {
    if (
      !this.nextStatuses(order.orderStatus).includes(status) ||
      this.orderSavingId() !== null
    ) {
      return;
    }

    if (
      status === 'CANCELLED' &&
      !confirm(`Cancel order #RT-${order.orderId}?`)
    ) {
      return;
    }

    this.orderSavingId.set(order.orderId);
    this.orderError.set('');
    this.orderMessage.set('');

    this.adminService.updateOrderStatus(
      order.orderId,
      status,
      this.sessionUsername,
      this.sessionPassword
    ).subscribe({
      next: updated => {
        this.orders.update(items =>
          items.map(item =>
            item.orderId === updated.orderId ? updated : item
          )
        );

        if (this.selectedOrder()?.orderId === updated.orderId) {
          this.selectedOrder.set(updated);
        }

        this.orderSavingId.set(null);

        this.orderMessage.set(
          `Order #RT-${updated.orderId} updated to ${updated.orderStatus}.`
        );

        this.refreshDashboard();
        this.loadProducts();
      },
      error: (err: HttpErrorResponse) => {
        this.orderSavingId.set(null);
        this.orderError.set(this.orderRequestError(err));
      }
    });
  }

  private orderRequestError(err: HttpErrorResponse): string {
    if (err.status === 401 || err.status === 403) {
      return 'Admin authentication failed. Please sign out and sign in again.';
    }
    if (err.status === 0) {
      return 'Cannot connect to Spring Boot.';
    }
    if (err.status === 404) {
      return 'Order not found.';
    }
    if (err.status === 409) {
      return 'This order status change is not allowed.';
    }
    return 'Order operation failed. Please try again.';
  }

  // INVENTORY ANALYTICS

  openAnalytics(): void {
    this.activeSection.set('analytics');
    this.loadProducts();
  }

  get inventoryValue(): number {
    return this.products().reduce(
      (total, product) => total + product.price * product.stock,
      0
    );
  }

  get totalStockUnits(): number {
    return this.products().reduce(
      (total, product) => total + product.stock,
      0
    );
  }

  get outOfStockProducts(): Product[] {
    return this.products().filter(product => product.stock === 0);
  }

  get lowStockProducts(): Product[] {
    return this.products().filter(
      product =>
        product.stock > 0 &&
        product.stock <= this.lowStockThreshold
    );
  }

  get healthyStockProducts(): Product[] {
    return this.products().filter(
      product => product.stock > this.lowStockThreshold
    );
  }

  get stockHealthPercentage(): number {
    if (this.products().length === 0) return 0;

    return Math.round(
      this.healthyStockProducts.length /
      this.products().length * 100
    );
  }

  get categoryAnalytics(): CategoryAnalytics[] {
    const categoryMap = new Map<string, CategoryAnalytics>();

    for (const product of this.products()) {
      const category = product.category?.trim() || 'Uncategorized';

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          products: 0,
          units: 0,
          value: 0,
          percentage: 0
        });
      }

      const entry = categoryMap.get(category)!;
      entry.products++;
      entry.units += product.stock;
      entry.value += product.price * product.stock;
    }

    const result = [...categoryMap.values()]
      .sort((a, b) => b.value - a.value);

    const maximum = Math.max(0, ...result.map(item => item.value));

    return result.map(item => ({
      ...item,
      percentage: maximum > 0
        ? Math.round(item.value / maximum * 100)
        : 0
    }));
  }

  get filteredInventory(): Product[] {
    const search = this.analyticsSearch.trim().toLowerCase();

    return this.products()
      .filter(product => {
        const matchesSearch =
          product.name.toLowerCase().includes(search) ||
          product.brand.toLowerCase().includes(search) ||
          (product.category ?? '').toLowerCase().includes(search);

        let matchesStatus = true;

        if (this.analyticsFilter === 'out') {
          matchesStatus = product.stock === 0;
        } else if (this.analyticsFilter === 'low') {
          matchesStatus =
            product.stock > 0 &&
            product.stock <= this.lowStockThreshold;
        } else if (this.analyticsFilter === 'healthy') {
          matchesStatus = product.stock > this.lowStockThreshold;
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.stock - b.stock);
  }

  getStockLabel(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= this.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  }

  // COMMON

  refreshDashboard(): void {
    if (!this.sessionUsername || !this.sessionPassword) return;

    this.adminService.getDashboard(
      this.sessionUsername,
      this.sessionPassword
    ).subscribe({
      next: data => this.dashboard.set(data)
    });
  }

  trackOrder(index: number, order: OrderResponse): number {
    return order.orderId;
  }

  trackProduct(index: number, product: Product): number {
    return product.id;
  }
}
