# ShopSense 🛍️✨

ShopSense is a full-stack, AI-powered e-commerce application designed to revolutionize the way you shop online.

## Live Demo
🚀 [Coming Soon to Google Cloud Run]

## Features
- 🤖 **AI Shopping Assistant**: Floating Gemini chat widget to help you discover products.
- 🔍 **Smart Search**: Context-aware AI intent extraction for highly accurate searches.
- ✨ **Personalization Engine**: Personalized product recommendations based on your viewing and order history.
- 🛒 **Full E-Commerce Flow**: Cart management, order history, and checkout validation.
- 🛡️ **Secure & Protected**: Middleware auth checks, Firestore Security Rules, and strict Content Security Policies.
- ♿ **Accessible**: WCAG AA compliant with keyboard support, ARIA live regions, and `prefers-reduced-motion`.

## Tech Stack & Google Services
- **Framework**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication (Google Sign-In)
- **Database**: Firestore (Native Mode)
- **AI Integration**: Google Gemini 1.5 Pro/Flash (`@google/generative-ai`)
- **Deployment**: Google Cloud Run (Docker containerized)

## Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd PROMPT_APP
   npm install
   ```

2. **Environment Variables**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env.local
   ```
   Add your `GEMINI_API_KEY` and `NEXT_PUBLIC_FIREBASE_*` credentials.

3. **Database Seed (Optional)**
   Populate your Firestore with 20 dummy products:
   ```bash
   npm run seed
   ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Testing Suite
- **Unit Tests (Jest)**: `npm test`
- **End-to-End & Accessibility Tests (Playwright)**: `npm run test:e2e`

## Architecture Overview
1. **Next.js Server Actions & Edge API Routes**: Handles chat requests, smart searches, and order processing securely.
2. **Gemini AI**: Powers the `/api/chat`, `/api/search`, and `/api/recommendations` routes securely via server-side logic (keys are never exposed to the client).
3. **Firestore**: Acts as the single source of truth for products, users, cart states, and historical data, protected by rigorous Firestore rules.
4. **Cloud Run**: Hosts the standalone Next.js docker image to easily autoscale based on demand.
