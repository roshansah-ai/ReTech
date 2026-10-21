
export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: 'COD' | 'SIMULATED_ONLINE';
  items: CheckoutItem[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  orderId: number;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItemResponse[];
}
