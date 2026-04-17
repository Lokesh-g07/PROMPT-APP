export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: (CartItem & { product: Product })[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
}
