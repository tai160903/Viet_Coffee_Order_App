export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  purchaseCount: number;
  isAvaillable: boolean;
  categoryId: string;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
}
