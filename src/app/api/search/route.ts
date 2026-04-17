import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Mock search intent
      const { query } = await req.json();
      return NextResponse.json({ intent: { keywords: [query], category: null, maxPrice: null, attributes: [] } });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const { query, userId } = await req.json();

    if (!query || typeof query !== 'string' || query.length > 200) {
      return NextResponse.json({ error: 'Invalid query string' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate Limiting (30 requests/min)
    const rateLimitRef = doc(db, `users/${userId}/rateLimits/search`);
    const rateLimitDoc = await getDoc(rateLimitRef);
    const now = Date.now();
    let count = 1;
    let windowStart = now;

    if (rateLimitDoc.exists()) {
      const data = rateLimitDoc.data();
      if (now - data.windowStart < 60000) {
        if (data.count >= 30) {
          return NextResponse.json({ error: 'Too Many Requests' }, { status: 429, headers: { 'Retry-After': '60' } });
        }
        count = data.count + 1;
        windowStart = data.windowStart;
      }
    }
    await setDoc(rateLimitRef, { count, windowStart }, { merge: true });

    // Intent extraction via Gemini
    const systemPrompt = `Extract search intent from this query: '${query}'. Return ONLY a JSON object with this exact structure: {"keywords": [string], "category": string|null, "maxPrice": number|null, "attributes": [string]}. Do not include markdown formatting or backticks.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: "You are an JSON extraction API." });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let intent;
    try {
      intent = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", responseText);
      // Fallback
      intent = { keywords: [query], category: null, maxPrice: null, attributes: [] };
    }

    return NextResponse.json({ intent });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
