import { db, isMockMode } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Product, CartItem, Order } from '@/types';

// Mock Data
let mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Case', description: 'Silicone case with magsafe.', price: 499, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/iphone/500/500', stock: 50, rating: 4.5, createdAt: Date.now() },
  { id: '2', name: 'Running Shoes', description: 'Lightweight marathon running shoes.', price: 2999, category: 'Sports', imageUrl: 'https://picsum.photos/seed/shoes/500/500', stock: 120, rating: 4.8, createdAt: Date.now() },
  { id: '3', name: 'JavaScript Book', description: 'Learn JS from scratch.', price: 599, category: 'Books', imageUrl: 'https://picsum.photos/seed/jsbook/500/500', stock: 200, rating: 4.2, createdAt: Date.now() },
  { id: '4', name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat.', price: 1299, category: 'Sports', imageUrl: 'https://picsum.photos/seed/yogamat/500/500', stock: 80, rating: 4.6, createdAt: Date.now() },
  { id: '5', name: 'Bluetooth Speaker', description: 'Waterproof portable speaker.', price: 1799, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/speaker/500/500', stock: 45, rating: 4.7, createdAt: Date.now() },
];

let mockCarts: Record<string, CartItem[]> = {};
let mockOrders: Record<string, Order[]> = {};

export const getProducts = async (): Promise<Product[]> => {
  if (isMockMode) return mockProducts;
  
  const productsCol = collection(db, 'products');
  const q = query(productsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (isMockMode) return mockProducts.find(p => p.id === id) || null;

  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const getCart = async (userId: string): Promise<CartItem[]> => {
  if (isMockMode) return mockCarts[userId] || [];

  const docRef = doc(db, `users/${userId}/carts/current`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().items as CartItem[];
  }
  return [];
};

export const addToCart = async (userId: string, productId: string, quantity: number): Promise<void> => {
  if (isMockMode) {
    if (!mockCarts[userId]) mockCarts[userId] = [];
    const items = mockCarts[userId];
    const existingIndex = items.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
      if (items[existingIndex].quantity <= 0) items.splice(existingIndex, 1);
    } else if (quantity > 0) {
      items.push({ productId, quantity });
    }
    return;
  }

  const cartRef = doc(db, `users/${userId}/carts/current`);
  const cartSnap = await getDoc(cartRef);
  
  let items: CartItem[] = [];
  if (cartSnap.exists()) {
    items = cartSnap.data().items as CartItem[];
    const existingIndex = items.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
      if (items[existingIndex].quantity <= 0) items.splice(existingIndex, 1);
    } else if (quantity > 0) {
      items.push({ productId, quantity });
    }
  } else if (quantity > 0) {
    items = [{ productId, quantity }];
  }

  await setDoc(cartRef, { items, updatedAt: serverTimestamp() }, { merge: true });
};

export const placeOrder = async (userId: string, items: (CartItem & { product: Product })[], address: any, total: number): Promise<string> => {
  const newOrder: Order = {
    id: isMockMode ? Math.random().toString(36).substring(7) : '',
    userId,
    items,
    shippingAddress: address,
    total,
    status: 'pending',
    createdAt: Date.now(),
  };

  if (isMockMode) {
    if (!mockOrders[userId]) mockOrders[userId] = [];
    mockOrders[userId].push(newOrder);
    mockCarts[userId] = [];
    return newOrder.id!;
  }

  const ordersRef = collection(db, `users/${userId}/orders`);
  const docRef = await addDoc(ordersRef, newOrder);
  
  // Clear cart
  const cartRef = doc(db, `users/${userId}/carts/current`);
  await setDoc(cartRef, { items: [], updatedAt: serverTimestamp() });
  
  return docRef.id;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  if (isMockMode) return mockOrders[userId] || [];

  const ordersRef = collection(db, `users/${userId}/orders`);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};
