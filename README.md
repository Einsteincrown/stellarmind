# StellarMind

**Autonomous AI Research Agent on Stellar**

StellarMind is an autonomous AI research agent that delivers sharp, crypto native research reports. It is unlocked via an x402 micropayment on the Stellar network, ensuring a secure and verifiable value exchange for high quality intelligence.

Demo link: 
Youtube: 

## ✦ How It Works
1. **Submit Query**: User enters a research query (e.g., "Analyze the impact of Soroban on Stellar TVL").
2. **x402 Micropayment**: The app signs and submits a real Stellar testnet transaction (0.0001 XLM) with the required memo: `StellarMind:x402`.
3. **Onchain Confirmation**: The transaction is confirmed on the Stellar blockchain.
4. **AI Research**: Once confirmed, the StellarMind agent (powered by Claude 3.5 Sonnet) generates a structured, insightful research report.
5. **Report Delivery**: The user receives a formatted report with Overview, Key Metrics, Recent Developments, and Outlook.

##  Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Blockchain**: Stellar SDK
- **AI Engine**: Gemini
- **Styling**: Tailwind CSS 4, Framer Motion
- **Typography**: DM Sans (Body), Space Grotesk (Headings)

## Hackathon
**Project built for**: [Stellar Hacks: Agents · DoraHacks 2026](https://dorahacks.io/)



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
