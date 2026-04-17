import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
  { name: 'iPhone 15 Case', description: 'Silicone case with magsafe.', price: 499, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/iphone/500/500', stock: 50, rating: 4.5 },
  { name: 'Running Shoes', description: 'Lightweight marathon running shoes.', price: 2999, category: 'Sports', imageUrl: 'https://picsum.photos/seed/shoes/500/500', stock: 120, rating: 4.8 },
  { name: 'JavaScript Book', description: 'Learn JS from scratch.', price: 599, category: 'Books', imageUrl: 'https://picsum.photos/seed/jsbook/500/500', stock: 200, rating: 4.2 },
  { name: 'Yoga Mat', description: 'Non-slip eco-friendly yoga mat.', price: 1299, category: 'Sports', imageUrl: 'https://picsum.photos/seed/yogamat/500/500', stock: 80, rating: 4.6 },
  { name: 'Bluetooth Speaker', description: 'Waterproof portable speaker.', price: 1799, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/speaker/500/500', stock: 45, rating: 4.7 },
  { name: 'Cotton T-Shirt', description: '100% organic cotton basic tee.', price: 399, category: 'Clothing', imageUrl: 'https://picsum.photos/seed/tshirt/500/500', stock: 300, rating: 4.1 },
  { name: 'Coffee Maker', description: 'Programmable drip coffee machine.', price: 3499, category: 'Home & Kitchen', imageUrl: 'https://picsum.photos/seed/coffee/500/500', stock: 30, rating: 4.9 },
  { name: 'Desk Lamp', description: 'LED desk lamp with USB port.', price: 899, category: 'Home & Kitchen', imageUrl: 'https://picsum.photos/seed/lamp/500/500', stock: 150, rating: 4.3 },
  { name: 'Novel: The Great Gatsby', description: 'Classic literature.', price: 299, category: 'Books', imageUrl: 'https://picsum.photos/seed/gatsby/500/500', stock: 500, rating: 4.5 },
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse.', price: 699, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/mouse/500/500', stock: 100, rating: 4.4 },
  { name: 'Winter Jacket', description: 'Warm insulated jacket.', price: 4999, category: 'Clothing', imageUrl: 'https://picsum.photos/seed/jacket/500/500', stock: 25, rating: 4.8 },
  { name: 'Dumbbell Set', description: 'Adjustable dumbbell set 20kg.', price: 2499, category: 'Sports', imageUrl: 'https://picsum.photos/seed/dumbbell/500/500', stock: 60, rating: 4.7 },
  { name: 'Cookware Set', description: 'Non-stick 10-piece pots and pans.', price: 5999, category: 'Home & Kitchen', imageUrl: 'https://picsum.photos/seed/cookware/500/500', stock: 15, rating: 4.9 },
  { name: 'Sci-Fi Book', description: 'Dune by Frank Herbert.', price: 499, category: 'Books', imageUrl: 'https://picsum.photos/seed/dune/500/500', stock: 110, rating: 4.8 },
  { name: 'Jeans', description: 'Slim fit denim jeans.', price: 1499, category: 'Clothing', imageUrl: 'https://picsum.photos/seed/jeans/500/500', stock: 90, rating: 4.2 },
  { name: 'Headphones', description: 'Noise cancelling over-ear headphones.', price: 8999, category: 'Electronics', imageUrl: 'https://picsum.photos/seed/headphones/500/500', stock: 40, rating: 4.9 },
  { name: 'Tennis Racket', description: 'Professional grade tennis racket.', price: 3499, category: 'Sports', imageUrl: 'https://picsum.photos/seed/tennis/500/500', stock: 35, rating: 4.6 },
  { name: 'Blender', description: 'High-speed smoothie blender.', price: 2199, category: 'Home & Kitchen', imageUrl: 'https://picsum.photos/seed/blender/500/500', stock: 55, rating: 4.5 },
  { name: 'History Book', description: 'Sapiens by Yuval Noah Harari.', price: 599, category: 'Books', imageUrl: 'https://picsum.photos/seed/sapiens/500/500', stock: 140, rating: 4.8 },
  { name: 'Sneakers', description: 'Casual everyday sneakers.', price: 1999, category: 'Clothing', imageUrl: 'https://picsum.photos/seed/sneakers/500/500', stock: 200, rating: 4.4 },
];

async function seed() {
  console.log("Seeding products...");
  const productsRef = collection(db, 'products');
  for (const p of sampleProducts) {
    try {
      await addDoc(productsRef, {
        ...p,
        createdAt: Date.now() // Use timestamp number for consistent sorting without admin sdk
      });
      console.log(`Added: ${p.name}`);
    } catch (e) {
      console.error(`Error adding ${p.name}:`, e);
    }
  }
  console.log("Seeding complete! Exiting...");
  process.exit(0);
}

seed();
