 ## StellarMind

An Autonomous AI research agent on Stellar. Powered by x402 micropayments 
on Stellar testnet pay per query.

Demo link: https://stellarmind-steel.vercel.app/
Youtube:

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

## Features
- Real Stellar testnet transactions (verifiable on stellar.expert)
- x402 micropayment gate per research query
- Dark / Light mode toggle
- Stellar brand design language

## Setup
1. Clone the repo
2. Add `.env` file with `VITE_GEMINI_API_KEY=your_key`
3. Run `npm install && npm run dev`
4. Fund your Stellar testnet account at friendbot.stellar.org

## Hackathon
Stellar Hacks: Agents · DoraHacks 2026
```
