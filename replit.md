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
- `/admin` - Protected admin panel for content/settings management
- `/admin/login` - Admin authentication page

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
- **Mailchimp**: Email collection via `supabase/functions/mailchimp-subscribe/` edge function (CRM only)
- **Stripe**: Payment checkout via `supabase/functions/create-checkout/` edge function
- **Stripe Webhook**: `supabase/functions/stripe-webhook/` — auto-triggers report generation on payment
- **Gemini 1.5 Flash/Pro** (primary): Report generation — free tier, `GEMINI_API_KEY` required
- **OpenAI GPT-4o** (fallback): Report generation fallback if Gemini fails, `OPENAI_API_KEY` required
- **Resend**: Transactional email delivery via `supabase/functions/send-report-email/`, `RESEND_API_KEY` required (free: 100 emails/day)

### Report Products
- **Complete Report (€29.99)**: 2500-3500 words, includes archetypes, master numbers, meditation, exercises
- **Master Premium Report (€59.99)**: 4500-6500 words, full spiritual transformation report

### Payment & Reports Flow
1. User clicks "Buy" on `/pricing` → fills form (name, email, birth date)
2. `create-checkout` edge function creates Stripe session + pending order in Supabase
3. User completes Stripe payment → redirected to `/success`
4. `stripe-webhook` confirms payment → order remains `pending`
5. Admin visits `/admin` → "Informes & Pedidos" tab → clicks "Generar"
6. `generate-report` edge function calls OpenAI GPT-4o → stores report text
7. Admin downloads TXT → marks as "Sent"

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client
- `@tanstack/react-query`: Data fetching and caching
- `react-router-dom`: Client-side routing
- `date-fns`: Date manipulation
- `lucide-react`: Icon library
- `zod` + `@hookform/resolvers`: Form validation
- `sonner` + custom toaster: Toast notifications

### Deployment
- Configured for Vercel deployment (`vercel.json` with CSP and iframe headers)
- Development server runs on port 5000
- Test framework: Vitest with jsdom environment