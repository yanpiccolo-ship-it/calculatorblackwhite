# Numerology Calculator Application

## Overview

This is a Numerology Calculator web application built with React, TypeScript, and Vite. It allows users to calculate various numerology numbers (Destiny, Soul, Personality, Personal Year) based on their name and birth date. The app features multi-language support (7 languages), Tarot card associations, and a premium PDF report upsell. It includes a license system for domain-based access control and an admin panel for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **State Management**: React Query (TanStack Query) for server state, React Context for auth state
- **Routing**: React Router DOM v6

### Design Patterns
- **Component Structure**: Feature-based organization with UI components in `src/components/ui/` and business components in `src/components/`
- **Hooks Pattern**: Custom hooks in `src/hooks/` for data fetching and shared logic
- **Context Pattern**: AuthContext for authentication state management
- **Path Aliases**: Uses `@/` alias pointing to `src/` directory

### Key Business Logic
- **Numerology Calculations**: Pythagorean system implementation in `src/lib/numerology.ts`
- **Tarot Mappings**: Major Arcana associations in `src/lib/tarot.ts`
- **Translations**: Static translations in `src/lib/translations.ts` with database-driven content override capability
- **License Checking**: Domain-based license validation for access control

### Authentication & Authorization
- Supabase Auth for user authentication
- Role-based access control via `user_roles` table
- Protected routes for admin panel (`/admin`)
- Admin login at `/admin/login`

### Page Structure
- `/` - Main numerology calculator (Index page)
- `/checkout/success` - Stripe checkout success landing page
- `/checkout/cancel` - Stripe checkout cancel landing page
- `/admin` - Protected admin panel for content/settings management
- `/admin/login` - Admin authentication page

### Stripe Checkout Integration
- Server logic: `api/_lib/stripe.ts` (creates Stripe Checkout sessions; product catalog with `premium_pdf`, `complete_report`, `master_premium`)
- Production handler: `api/create-checkout-session.ts` (Vercel serverless function)
- Dev handler: `vite-plugins/stripe-api.ts` (Vite middleware that mirrors all 3 API routes)
- Frontend helper: `src/lib/stripeCheckout.ts` (`createCheckoutSession()`)
- Triggered from `src/components/PremiumUpsell.tsx` (€9.99 single-button) and `src/components/ProductsShowcase.tsx` (3-tier showcase, gated by `products_showcase_enabled` setting)
- Required env var: `STRIPE_SECRET_KEY` (test or live)

### Automated Report Fulfillment Pipeline (T030)
End-to-end flow: Stripe payment → Supabase order → OpenAI report → PDF → email.

**Backend modules** (all under `api/_lib/`):
- `supabaseAdmin.ts` — service-role Supabase client (server only)
- `numerologyServer.ts` — server-side port of the numerology calculator
- `prompts.ts` — master prompts per product (Spanish, multilang output)
- `openai.ts` — `generateReport()` calls `gpt-4o`
- `pdf.ts` — `buildReportPdf()` renders Markdown-ish text to A4 PDF via `pdfkit`
- `resend.ts` — `sendReportEmail()` and `sendSubscriptionWelcomeEmail()`
- `orders.ts` — `createOrderFromStripeSession()`, `processOrder()`, storage upload
- `adminAuth.ts` — `assertAdminFromRequest()` validates Supabase JWT + admin role

**API routes**:
- `POST /api/create-checkout-session` — creates Stripe Checkout
- `POST /api/stripe-webhook` — handles `checkout.session.completed`, subscription events; triggers `processOrder` async
- `POST /api/process-order` — admin-only manual trigger (regenerate / resend)

**Admin panel**:
- New "Órdenes" tab in `/admin` (default) → `src/components/admin/OrdersPanel.tsx`
- Lists orders, filters by status/product, regenerate + resend + download PDF

**Required Supabase setup** (run once via Supabase SQL editor):
- File: `supabase/migrations/20260426_orders_and_subscriptions.sql`
- Creates: `orders`, `subscriptions`, `report_prompts`, `stripe_webhook_events` + RLS + storage bucket `reports`

**Required env vars**:
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ⚠ set after deploying webhook to dresstyle.world
- `OPENAI_API_KEY` ✅
- `RESEND_API_KEY` ✅
- `SUPABASE_URL` + `SERVICE_ROLE_KEY` ✅
- `EMAIL_FROM` ✅ (`Numerology Reading <numerology.reading@dresstyle.world>`)
- `APP_URL` ✅ (`https://dresstyle.world`)

**Feature toggle**:
- `products_showcase_enabled` setting in `app_settings` controls whether the 3-tier showcase is visible on the calculator. Default: false.

## External Dependencies

### Backend as a Service
- **Supabase**: Handles authentication, database, and real-time features
  - Client configured in `src/integrations/supabase/client.ts`
  - Tables: `app_content`, `app_settings`, `licenses`, `user_roles`

### Database Schema (Supabase)
- `app_content`: Stores translatable content (UI labels, number meanings, Tarot meanings)
- `app_settings`: Key-value store for application settings (pricing, checkout URL, etc.)
- `licenses`: Domain-based license management for access control
- `user_roles`: Role assignments for admin access

### Third-Party Integrations
- **Mailchimp**: Email collection configuration in `src/lib/appConfig.ts` (API key, list ID, server)
- **External Checkout**: Configurable checkout URL for premium PDF reports

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client
- `@tanstack/react-query`: Data fetching and caching
- `react-router-dom`: Client-side routing
- `date-fns`: Date manipulation
- `lucide-react`: Icon library
- `zod` + `@hookform/resolvers`: Form validation
- `sonner` + custom toaster: Toast notifications

### Deployment
- **Replit Autoscale** (configured): `npm run build` → `npm run start` (Express server in `server/index.ts`)
- The Express server serves the built `dist/` SPA and mounts the three API routes (`/api/create-checkout-session`, `/api/stripe-webhook` with raw body, `/api/process-order`).
- Also Vercel-compatible (`vercel.json` with CSP and iframe headers) — the same `api/*.ts` files are imported by both runtimes.
- Development server runs on port 5000 (Vite + middleware in `vite-plugins/stripe-api.ts`)
- Test framework: Vitest with jsdom environment

### Supabase bootstrap (one-time, run by user)
The app's database lives in the user's Supabase project (`nyukbjuktrqhpthcvqyj`). The user must paste two SQL files into the Supabase SQL editor:
1. `supabase/migrations/_BOOTSTRAP_RUN_ME.sql` — creates `user_roles`, `orders`, `subscriptions`, `report_prompts`, `stripe_webhook_events`, RLS policies, triggers, and the `reports` storage bucket. Idempotent.
2. `supabase/migrations/_MAKE_ME_ADMIN.sql` — grants `admin` role to the user's email (must edit the email at the top first).

### Admin user + sample data (already seeded)
- Admin user: `yanpiccolo@gmail.com` (admin role assigned via `scripts/seed_test_orders.ts`)
- 3 sample orders with PDFs are visible in the admin "Órdenes" tab (status='completed'), generated by `scripts/seed_demo_reports.ts` using hand-written demo Spanish text (used as fallback when OpenAI quota is exhausted).
- For real customer flow to work end-to-end, the user must:
  1. Top up their OpenAI account (at /settings/organization/billing) — current key returns 429 quota exceeded
  2. Verify the `dresstyle.world` domain in Resend (resend.com/domains) so emails can be sent from `numerology.reading@dresstyle.world` to any recipient. Without this, the Resend free tier only allows sending to the Resend account owner (`littleblackjacketok@gmail.com`).