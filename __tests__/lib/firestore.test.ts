import { getProducts, getProductById, addToCart } from '@/lib/firestore';

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      { id: '1', data: () => ({ name: 'Test Product 1', price: 100 }) },
      { id: '2', data: () => ({ name: 'Test Product 2', price: 200 }) },
    ]
  }),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    id: '1',
    data: () => ({ name: 'Test Product 1', price: 100, items: [] })
  }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe('Firestore Utils', () => {
  it('getProducts() returns array of products', async () => {
    const products = await getProducts();
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Test Product 1');
  });

  it('getProductById() returns correct product', async () => {
    const product = await getProductById('1');
    expect(product).toBeDefined();
    expect(product?.name).toBe('Test Product 1');
  });

  it('addToCart() adds item', async () => {
    // Should not throw
    await expect(addToCart('user123', 'product1', 1)).resolves.toBeUndefined();
  });
});
