import { POST } from '@/app/api/chat/route';

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({
          sendMessage: jest.fn().mockResolvedValue({
            response: { text: () => 'Mocked AI Response' }
          })
        })
      })
    }))
  };
});

jest.mock('@/lib/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  collection: jest.fn(),
}));
jest.mock('@/lib/firestore', () => ({
  getCart: jest.fn().mockResolvedValue([]),
  getOrders: jest.fn().mockResolvedValue([]),
  getProducts: jest.fn().mockResolvedValue([]),
}));

describe('Chat API', () => {
  it('returns 200 with message for valid input', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello', userId: 'user1', history: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe('Mocked AI Response');
  });

  it('returns 400 for missing message', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user1', history: [] })
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
