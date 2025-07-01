# Ventry - Your AI COO

**Tagline**: *Your AI COO that tells you what to focus on every day*

Ventry is a full-stack web application that helps business professionals prioritize their daily tasks using AI-powered insights. Stop wondering what to work on next—Ventry analyzes your goals and generates smart, actionable daily tasks that actually move your business forward.

## 🚀 Key Features

### ✅ **Daily Actionable Tasks**
- AI generates 3-5 smart, prioritized tasks every day based on your goals
- Tasks are ordered by priority and timestamped for the day
- Clean UI with clear task descriptions and completion tracking

### ✅ **Task Explanations** 
- Every task includes a clear explanation of *why* it's suggested
- Explanations build trust and show business logic (e.g., "because you said Q2 is focused on growth, and sales are down 12% week over week")
- Connects tasks directly to your stated goals

### ✅ **Manual Goal Input**
- Simple interface to submit goals like "Q2: grow revenue 20%" or "This week: fix retention"
- App remembers your goals and feeds them into LLM context
- Updates task suggestions accordingly based on goal changes

### ✅ **RAG-Powered Recommendations**
- Basic Retrieval-Augmented Generation using curated business knowledge
- Pulls from SME playbooks and operational strategies
- Hardcoded knowledge base with proven business frameworks
- Structured for easy expansion and improvement

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: Radix UI primitives with custom styled components
- **AI**: OpenAI GPT-4 for task generation and explanations
- **Authentication**: Simple localStorage-based auth (production-ready auth can be added)
- **State Management**: React hooks with localStorage persistence
- **Deployment**: Optimized for Vercel deployment

## 🏗 Project Structure

```
ventry1.0/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── landing/           # Landing page components
│   ├── lib/                   # Utility functions
│   │   ├── utils.ts           # General utilities
│   │   └── openai.ts          # OpenAI integration
│   ├── types/                 # TypeScript interfaces
│   ├── data/                  # Static data and knowledge base
│   └── styles/                # Global styles
├── public/                    # Static assets
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (optional for full functionality)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd ventry1.0
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Usage

1. **Landing Page**: Visit the homepage to see the product overview
2. **Sign In**: Click "Get Started" and use any email/password (demo mode)
3. **Add Goals**: In the dashboard, add your business goals (e.g., "Increase revenue by 25% this quarter")
4. **Generate Tasks**: Click "Generate Tasks" to get AI-powered daily priorities
5. **Complete Tasks**: Mark tasks as complete and see explanations for each recommendation

## 🎯 Core User Flow

1. **Goal Setting**: Users input their business objectives with timeframes and priorities
2. **AI Analysis**: System analyzes goals against business knowledge base
3. **Task Generation**: AI creates specific, actionable daily tasks with explanations
4. **Execution**: Users work through prioritized tasks with clear reasoning
5. **Progress Tracking**: Dashboard shows completion rates and goal progress

## 🤖 AI Features

### Task Generation
- Uses OpenAI GPT-4 for intelligent task creation
- Contextually aware of user goals and business best practices
- Generates 3-5 tasks per session with priority ranking

### Business Knowledge Integration
- Curated knowledge base with proven strategies
- Categories: Growth, Sales, Retention, Operations, Strategy
- RAG implementation for context-aware recommendations

### Smart Explanations
- Each task includes "why this matters" reasoning
- Connects daily activities to larger business goals
- Builds user confidence in AI recommendations

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub** and connect to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)
3. **Deploy**: Automatic deployment on push to main branch

### Environment Variables for Production
```
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
VERCEL_URL=your_vercel_deployment_url
```

## 🔮 Future Enhancements

### Near-term
- [ ] Proper user authentication (NextAuth.js or Auth0)
- [ ] Database integration (PostgreSQL + Prisma)
- [ ] Real-time task generation API
- [ ] Mobile responsive improvements

### Long-term
- [ ] Advanced RAG with vector embeddings
- [ ] Team collaboration features
- [ ] Integration with calendar and project management tools
- [ ] Analytics and goal progress tracking
- [ ] Custom knowledge base uploads

## 🏛 Architecture Decisions

### Why Next.js App Router?
- Modern React patterns with server components
- Built-in routing and API routes
- Excellent performance and SEO

### Why localStorage for Demo?
- Quick setup for MVP demonstration
- No database setup required
- Easy to migrate to real persistence later

### Why Tailwind CSS?
- Rapid UI development
- Consistent design system
- Easy customization and theming

### Why OpenAI?
- State-of-the-art language model
- Reliable API with good documentation
- Easy integration for task generation

## 🐛 Known Limitations

- Authentication is demo-only (localStorage)
- Data persistence is browser-local only
- AI task generation is simulated in development (requires OpenAI API key)
- No real-time collaboration features
- Limited mobile optimization

## 📄 License

This project is built for demonstration purposes. Feel free to use and modify as needed.

---

**Built with ❤️ for busy executives who want to focus on what matters most.**
