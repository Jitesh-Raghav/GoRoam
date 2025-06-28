# GoRoam - AI-Powered Travel Itinerary Planning

A modern, full-stack SaaS application for planning travel itineraries using AI technology. Built with Next.js, TypeScript, Tailwind CSS, Shadcn UI, and Framer Motion.

## 🌟 Features

- **AI-Powered Itineraries**: Generate personalized travel plans using advanced AI
- **Real-Time Interactive Maps**: Explore destinations with live maps and navigation
- **Downloadable PDF Plans**: Export itineraries as beautiful PDFs for offline access
- **Flexible Credit System**: Pay-per-use pricing model with multiple plan options
- **Responsive Design**: Beautiful UI that works on all devices
- **Smooth Animations**: Enhanced UX with Framer Motion animations

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate-itinerary/    # AI itinerary generation
│   │   ├── credits/               # Credit management
│   │   └── save-itinerary/        # Save/retrieve itineraries
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main app with sidebar
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   └── landing/          # Landing page sections
│       ├── hero-section.tsx
│       ├── features-section.tsx
│       ├── testimonials-section.tsx
│       ├── pricing-section.tsx
│       ├── cta-section.tsx
│       └── footer.tsx
├── lib/                  # Utility functions
└── styles/               # Global styles
```

## 🛣️ Routes

- `/` - Landing page with hero, features, testimonials, pricing
- `/auth` - Authentication (login/signup)
- `/dashboard` - Main application dashboard
- `/api/generate-itinerary` - POST endpoint for AI itinerary generation
- `/api/credits` - GET/POST endpoints for credit management
- `/api/save-itinerary` - GET/POST endpoints for saving itineraries

## 💰 Pricing Plans

- **Free**: ₹0 - 3 credits forever
- **Pro**: ₹299 - 20 credits (one-time payment)
- **Premium**: ₹599 - 50 credits (one-time payment)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd goroam
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Components

This project uses Shadcn UI. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## 🎨 Design System

- **Primary Color**: Blue (#2563eb)
- **Typography**: Geist Sans & Geist Mono
- **Spacing**: Tailwind's default spacing scale
- **Breakpoints**: Mobile-first responsive design

## 📱 Responsive Design

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- Large: 1280px+

## 🌐 API Endpoints

### Generate Itinerary
```typescript
POST /api/generate-itinerary
{
  "destination": "Paris, France",
  "duration": "5 days",
  "preferences": ["culture", "food", "museums"]
}
```

### Credit Management
```typescript
GET /api/credits
POST /api/credits
{
  "action": "purchase" | "deduct",
  "amount": 20
}
```

### Save Itinerary
```typescript
POST /api/save-itinerary
{
  "userId": "user_123",
  "itineraryData": {...}
}
```

## 🔮 Future Enhancements

- [ ] User authentication with NextAuth.js
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Payment processing (Stripe/Razorpay)
- [ ] Real OpenAI API integration
- [ ] Email notifications
- [ ] Social sharing features
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **UI/UX**: Shadcn UI, Framer Motion
- **Infrastructure**: Vercel (recommended for deployment)

---

Built with ❤️ for travelers worldwide. Start planning your next adventure with GoRoam!
