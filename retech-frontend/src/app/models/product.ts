
export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  conditionGrade: 'A' | 'B' | 'C';
  imageUrl: string;
  warrantyMonths: number;
}
