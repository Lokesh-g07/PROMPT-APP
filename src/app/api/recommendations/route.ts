import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, limit, orderBy } from 'firebase/firestore';
import { getProducts, getOrders } from '@/lib/firestore';
import { Product } from '@/types';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const allProducts = await getProducts();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return mock recommendations (first 6)
      return NextResponse.json({ recommendations: allProducts.slice(0, 6) });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    if (!userId) {
      // Fallback to bestsellers (first 6 for prototype)
      return NextResponse.json({ recommendations: allProducts.slice(0, 6) });
    }

    // Check Cache
    const cacheRef = doc(db, `users/${userId}/recommendations/cache`);
    const cacheDoc = await getDoc(cacheRef);
    if (cacheDoc.exists()) {
      const data = cacheDoc.data();
      // 1 hour TTL
      if (Date.now() - data.updatedAt < 3600000) {
        const cachedProducts = data.productIds
          .map((id: string) => allProducts.find(p => p.id === id))
          .filter(Boolean);
        return NextResponse.json({ recommendations: cachedProducts });
      }
    }

    // Fetch user context
    const viewHistorySnapshot = await getDocs(query(collection(db, `users/${userId}/viewHistory`), limit(10)));
    const viewHistory = viewHistorySnapshot.docs.map(d => d.data().productId);
    const orderHistory = await getOrders(userId);
    const orderedProducts = orderHistory.flatMap(o => o.items.map(i => i.productId));

    if (viewHistory.length === 0 && orderedProducts.length === 0) {
      return NextResponse.json({ recommendations: allProducts.slice(0, 6) });
    }

    // Call Gemini
    const productListString = allProducts.map(p => `{id: "${p.id}", name: "${p.name}", category: "${p.category}"}`).join(", ");
    
    const systemPrompt = `You are a recommendation engine. Rank the top 6 most relevant products for a user based on their history.
User viewed product IDs: ${JSON.stringify(viewHistory)}
User ordered product IDs: ${JSON.stringify(orderedProducts)}
Available products: [${productListString}]
Return ONLY a JSON array of 6 product IDs, ordered by relevance. Example: ["id1", "id2"]. No markdown formatting.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let recommendedIds: string[] = [];
    try {
      recommendedIds = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini recommendations:", responseText);
      recommendedIds = allProducts.slice(0, 6).map(p => p.id);
    }

    // Ensure we have 6, fallback to default if Gemini fails
    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      recommendedIds = allProducts.slice(0, 6).map(p => p.id);
    }

    // Save Cache
    await setDoc(cacheRef, {
      productIds: recommendedIds.slice(0, 6),
      updatedAt: Date.now()
    });

    const recommendedProducts = recommendedIds
      .slice(0, 6)
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);

    return NextResponse.json({ recommendations: recommendedProducts });
  } catch (error) {
    console.error("Recommendations API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
