
import { OrderResponse } from './order';

export interface AdminDashboardResponse {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: OrderResponse[];
}
