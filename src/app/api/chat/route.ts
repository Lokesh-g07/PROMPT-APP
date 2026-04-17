import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProducts, getCart, getOrders } from '@/lib/firestore';
// For server side admin operations (like rate limits and conversation saving), we use standard firebase client sdk for prototype
// since we don't have admin sdk installed. Alternatively, we could mock the database save if it fails due to auth.
// Wait, prompt instructed to save full conversation under users/{userId}/conversations/{sessionId}
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ reply: 'Mock AI Response: Please configure your GEMINI_API_KEY to enable AI chat.' });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const { message, userId, history } = await req.json();

    if (!message || message.length > 500) {
      return NextResponse.json({ error: 'Invalid message. Must be string and max 500 chars.' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate Limiting Check
    const rateLimitRef = doc(db, `users/${userId}/rateLimits/chat`);
    const rateLimitDoc = await getDoc(rateLimitRef);
    const now = Date.now();
    let count = 1;
    let windowStart = now;

    if (rateLimitDoc.exists()) {
      const data = rateLimitDoc.data();
      if (now - data.windowStart < 60000) { // Within 1 minute
        if (data.count >= 10) {
          return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': '60' } });
        }
        count = data.count + 1;
        windowStart = data.windowStart;
      }
    }
    await setDoc(rateLimitRef, { count, windowStart }, { merge: true });

    // Fetch Context
    const cartItems = await getCart(userId);
    const orderHistory = await getOrders(userId);
    const productList = await getProducts(); // Usually we wouldn't fetch ALL products, but prompt asks for "Available products: {productList}"

    const systemPrompt = `You are ShopSense AI, a helpful shopping assistant. You help users find products, compare items, and make purchase decisions. 
User's cart: ${JSON.stringify(cartItems)}. 
Recent orders: ${JSON.stringify(orderHistory)}. 
Available products: ${JSON.stringify(productList)}. 
Always be concise, friendly, and suggest specific products when relevant. If a product is mentioned, make it a clickable HTML link to /product/[id] (e.g., <a href="/product/123" class="text-blue-200 underline">Product Name</a>).`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: systemPrompt });

    const chat = model.startChat({
      history: history.slice(0, -1), // Everything except the last user message
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // Store conversation
    const sessionId = 'current-session'; // For simplicity
    const convRef = doc(db, `users/${userId}/conversations/${sessionId}`);
    await setDoc(convRef, {
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ],
      updatedAt: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
