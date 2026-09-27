# GoRoam - AI-Powered Travel Itinerary Planning

A modern, full-stack SaaS application for planning travel itineraries using AI technology. Built with Next.js, TypeScript, Tailwind CSS, Shadcn UI, and Framer Motion.

## 🌟 Features

- **AI-Powered Itineraries**: A 4-step planner (route, who & budget, style, details) feeds a day-by-day plan with local tips, stays, essentials and a packing list
- **Book it all**: Flights, stays, tickets and transport open on partner sites (Google Flights, Skyscanner, Kayak, Booking.com, Expedia, Airbnb, GetYourGuide, Viator, Klook, Rome2Rio) prefilled with the trip's route, dates and party
- **Day route maps**: Every day is pinned on a map, with one-tap multi-stop directions in Google Maps
- **Share, sync, print**: Private read-only share links, calendar (.ics) export and print-ready PDFs
- **Before-you-go checklist**: Pre-trip to-dos and a destination-specific packing list, saved on the device
- **Flexible Credit System**: Pay-per-use pricing model with multiple plan options
- **Responsive Design**: Beautiful UI that works on all devices
- **Smooth Animations**: Enhanced UX with Framer Motion animations

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI primitives + a custom design system
- **Animations**: Framer Motion, Lenis (smooth scroll), cobe (WebGL globe)
- **Illustrations**: Procedural SVG destination scenes (no image assets)
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
- `/dashboard` - Trip planner
- `/dashboard/itinerary/[id]` - Itinerary, budget, bookings, stays, essentials, checklist
- `/dashboard/book` - Booking hub
- `/trip/[id]?t=…` - Public, read-only shared itinerary (signed link)
- `/api/generate-itinerary` - POST endpoint for AI itinerary generation
- `/api/user/credits` - GET the signed-in user's credit balance
- `/api/checkout` - POST `{ planId }` to start a Dodo Payments checkout
- `/api/webhooks/dodo` - Dodo Payments webhook (adds or removes credits)
- `/api/payments` - GET the signed-in user's purchases
- `/api/save-itinerary` - GET/POST endpoints for saving itineraries

## 💰 Pricing Plans

Defined once in `src/lib/plans.ts` and used across the site. 1 credit = 1 itinerary; credits never expire.

- **Free**: 1 credit (one full itinerary) for every new account
- **Starter**: $9.99 - 10 credits (one-time)
- **Explorer**: $24.99 - 30 credits (one-time)
- **Adventurer**: $69.99 - 90 credits (one-time)

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

### Environment

Besides `DATABASE_URL`, `NEXTAUTH_SECRET` (also signs share links), `NEXTAUTH_URL`, the Google OAuth keys and `OPENAI_API_KEY`, these optional affiliate IDs are appended to booking links when set:

- `NEXT_PUBLIC_BOOKING_AID` - Booking.com affiliate id
- `NEXT_PUBLIC_GYG_PARTNER_ID` - GetYourGuide partner id
- `NEXT_PUBLIC_SKYSCANNER_ASSOCIATE` - Skyscanner associate id

### Payments (Dodo Payments)

Credit packs are sold through [Dodo Payments](https://dodopayments.com) hosted checkout. Credits are added **only** by the webhook, never by the redirect back to the site.

1. In the Dodo dashboard (start in **Test mode**), create three **one-time** products priced like `src/lib/plans.ts`: Starter $9.99, Explorer $24.99, Adventurer $69.99.
2. Add a webhook endpoint `https://<your-domain>/api/webhooks/dodo` subscribed to `payment.succeeded`, `refund.succeeded` and `dispute.lost`, and copy its signing secret.
3. Set these environment variables (Vercel → Settings → Environment Variables):
   - `DODO_PAYMENTS_API_KEY` - API key
   - `DODO_PAYMENTS_WEBHOOK_KEY` - webhook signing secret
   - `DODO_PAYMENTS_ENVIRONMENT` - `test_mode` (default) or `live_mode`
   - `DODO_PRODUCT_STARTER`, `DODO_PRODUCT_EXPLORER`, `DODO_PRODUCT_ADVENTURER` - the product ids (`pdt_…`)

The `Payment` table is created automatically on the next deploy — see **Database schema** below.

Until the API key and all three product ids are set, the buy buttons show "Online checkout isn't available yet." When going live, switch to live-mode keys, live product ids and a live webhook secret together.

### Database schema

There's no migrations folder: the build script itself runs `prisma db push` (`"vercel-build"` in `package.json`), so every deploy syncs the live database to whatever is in `schema.prisma`. Editing that file is enough — you don't need to run anything by hand.

The one exception is a change that would **drop or truncate a column with data in it** (e.g. deleting a field, changing its type). `db push` refuses those instead of applying them silently, so the build fails loudly with a "data loss" error rather than deploying and quietly deleting something. If that happens, resolve it locally (`DATABASE_URL="<prod-url>" npx prisma db push`, which shows the same warning and lets you decide) before pushing again.

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

- **Palette**: warm paper (`#f5f1ea`), ink (`#15130f`) and the brand orange from the logo (`#d95501`) — defined as tokens in `src/app/globals.css` (`bg-paper`, `text-ink`, `text-brand`, …)
- **Typography**: Instrument Serif for display, Geist Sans for UI, Geist Mono for labels and coordinates
- **Motion**: masked word reveals, scroll-linked sections, magnetic pills; everything respects `prefers-reduced-motion`
- **Illustrations**: `src/components/scenes/` renders every destination as a layered, animated SVG scene — monuments in `monuments.ts`, compositions in `scenes.tsx`. `sceneForDestination()` in `src/lib/destinations.ts` picks a poster for any trip
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

### Credits & payments
```typescript
GET  /api/user/credits            // → { credits }
POST /api/checkout                // { planId: "starter" | "explorer" | "adventurer" } → { url }
POST /api/webhooks/dodo           // signed by Dodo; payment.succeeded / refund.succeeded / dispute.lost
GET  /api/payments                // → purchase history
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
