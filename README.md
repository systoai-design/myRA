# myRA — AI-Powered Retirement Planning Advisor

myRA (My Retirement Advisor) is an AI virtual advisor that helps users plan for retirement through an interactive, conversational experience. Built with React, TypeScript, and powered by Groq's LLM API.

## Features

- **9-Phase Conversational Flow** — Guided retirement planning from introduction through strategy implementation
- **Asset Bucket Analysis** — Categorizes savings into Pre-Tax, Post-Tax, and Tax-Free buckets
- **Income Gap Calculator** — Identifies the gap between guaranteed income and target retirement salary
- **Interactive Charts** — Visual breakdowns of asset allocation and income gaps using Recharts
- **Lead Capture** — Collects user contact info for follow-up advisory sessions
- **Sound Effects & Typing Indicators** — Polished chat UX with audio feedback

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Groq API (Llama 3.3 70B)
- **Backend**: Supabase (auth, database, edge functions)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

```bash
# Clone the repo
git clone https://github.com/systoai-design/myRA.git
cd myRA

# Install dependencies
npm install

# Create .env file with your keys
cp .env.example .env

# Start dev server
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

## Deployment

Deployed on **Netlify**. Make sure to add all environment variables in the Netlify dashboard under **Site settings > Environment variables**.

## License

Private — All rights reserved.
