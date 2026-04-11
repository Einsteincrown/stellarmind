# StellarMind

An Autonomous AI research agent on Stellar. Powered by x402 micropayments 
on Stellar testnetpay per query.

## How It Works
1. User submits a research query
2. App signs and submits a real Stellar testnet transaction (x402 micropayment)
3. Transaction confirmed onchain with memo "StellarMind:x402"
4. AI research agent unlocks and returns a structured report

## Tech Stack
- React + TypeScript + Vite
- Stellar SDK — testnet transactions
- Gemini AI — research report generation
- Tailwind CSS — Stellar-branded UI
- Vercel — deployment


## Hackathon
Stellar Hacks: Agents · DoraHacks 2026


## Setup
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd stellarmind
   ```
2. **Configure Environment**:
   Create a `.env` file (or use AI Studio Secrets):
   ```env
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

