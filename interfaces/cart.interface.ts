export interface Cart {
  id: string;
  customerId: string;
  totalAmount: number;
  cartItems: CartItem[];
}

export interface CartItem {
  id?: string;
  quantity: number;
  unitPrice: number;
  customize: Customize;
}

export interface Customize {
  id?: string;
  note?: string;
  size: string;
  product: string;
  price: number;
  extra: number | 0;
  customizeToppings?: CustomizeTopping[];
}

export interface CustomizeTopping {
  topping: string;
  quantity: number;
}
