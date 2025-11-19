## Relevant Files

- `app/page.tsx` - Landing page for the platform.
- `app/dashboard/page.tsx` - Main dashboard for creators (campaign list, stats).
- `app/dashboard/create/page.tsx` - Campaign creation wizard.
- `app/[creatorSlug]/[campaignSlug]/page.tsx` - The public "GatePage" view for visitors.
- `lib/supabase/server.ts` - Server-side Supabase client.
- `lib/supabase/client.ts` - Client-side Supabase client.
- `app/api/verify/email/route.ts` - API endpoint for email PIN verification.
- `app/api/verify/x/route.ts` - API endpoint for X (Twitter) verification.
- `app/api/verify/youtube/route.ts` - API endpoint for YouTube verification.
- `app/api/verify/linkedin/route.ts` - API endpoint for LinkedIn verification.
- `app/api/stripe/webhook/route.ts` - Webhook handler for Stripe events.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- **Important:** When adding a custom domain (e.g., `gatepage.io`), remember to update `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Project Initialization
  - [x] 0.1 Initialize Next.js 14+ project with TypeScript and Tailwind CSS (`npx create-next-app@latest gatepage`).
  - [x] 0.2 Install dependencies: `shadcn/ui` (if using), `@supabase/ssr`, `@supabase/supabase-js`, `stripe`, `resend`.
  - [x] 0.3 Configure environment variables (`.env.local`) for Supabase, Stripe, Resend, and Social OAuth keys.
  - [x] 0.4 Set up Git repository and initial commit.

- [ ] 1.0 Authentication & Database Schema
  - [ ] 1.1 Configure Supabase Auth: Enable Email/Password and Google providers in Supabase Dashboard.
  - [ ] 1.2 Create `users` table (extends Supabase auth.users) to store profile info (billing status, Stripe ID).
  - [ ] 1.3 Create `campaigns` table:
    - `id` (UUID), `creator_id` (FK), `title`, `description`, `slug` (unique), `header_image`, `logo`, `destination_url`, `file_path` (for uploads), `delivery_method` ('reveal', 'email', 'both'), `status` ('draft', 'active', 'ended').
  - [ ] 1.4 Create `tasks` table:
    - `id`, `campaign_id` (FK), `type` ('email', 'x_follow', 'x_repost', 'x_like', 'linkedin_share', 'yt_subscribe'), `config` (JSONB for specific details like target URL/handle), `order_index`.
  - [ ] 1.5 Create `leads` table:
    - `id`, `campaign_id` (FK), `email`, `status` ('pending', 'completed'), `task_progress` (JSONB), `created_at`.
  - [ ] 1.6 Set up Row Level Security (RLS) policies for all tables.

- [x] 2.0 Campaign Creator Wizard (The "Builder")
  - [x] 2.1 Create `app/dashboard/create/page.tsx`: Multi-step form or single page with sections.
  - [x] 2.2 Implement "Basic Info" section: Title, Slug, Description, Image/Logo upload (Supabase Storage).
  - [x] 2.3 Implement "Destination" section: Toggle between URL input and File Upload.
  - [x] 2.4 Implement "Action Builder":
    - UI to add/remove tasks.
    - Config forms for each task type (e.g., "Enter X Username to follow").
  - [x] 2.5 Implement "Delivery Settings": Selection for Reveal/Email/Both.
  - [x] 2.6 Save functionality: Persist campaign and tasks to Supabase.

- [x] 3.0 Public GatePage Implementation
  - [x] 3.1 Create dynamic route `app/[creatorSlug]/[campaignSlug]/page.tsx`.
  - [x] 3.2 Implement Server Action/API to fetch campaign data by slug (handle 404s).
  - [x] 3.3 Create "Guest Identity" logic: Check LocalStorage/Cookies for existing session or task progress.
  - [x] 3.4 Render Campaign UI: Header, Description, Task List.
  - [x] 3.5 Implement Task List UI:
    - Visual state for each task (Pending, Loading, Completed).
    - Click handlers for actions.

- [ ] 4.0 Task Verification Logic
  - [x] 4.1 Implement Email Verification:
    - API `POST /api/verify/email/send`: Send PIN via Resend.
    - API `POST /api/verify/email/check`: Validate PIN and mark task complete.
  - [x] 4.2 Implement X (Twitter) Verification:
    - OAuth flow initiation ("Sign in with X").
    - Callback handler: Exchange code for token.
    - Verification logic: Call X API `GET /2/users/:id/following` (if Basic tier) OR fallback to "Ownership Check" (just successful login).
  - [x] 4.3 Implement YouTube Verification:
    - OAuth flow ("Sign in with Google").
    - Verification logic: Call YouTube Data API to check subscription status.
  - [x] 4.4 Implement LinkedIn Verification:
    - OAuth flow.
    - Verification logic: Check for "Share" activity (API dependent).
  - [ ] 4.5 Implement "Unlock" Logic:
    - When all tasks complete -> Show Destination Button (if 'reveal' mode).
    - Trigger Email Delivery (if 'email' mode) via Resend.

- [ ] 5.0 Dashboard & Analytics
  - [ ] 5.1 Create `app/dashboard/page.tsx`: Fetch and list user's campaigns.
  - [ ] 5.2 Add "Lead Export" button: Generate CSV from `leads` table for a specific campaign.
  - [ ] 5.3 Display simple stats: Total Views (increment on page load), Total Completions (count from `leads`).

- [ ] 6.0 Stripe Monetization Integration
  - [ ] 6.1 Configure Stripe Products (Free vs Pro).
  - [ ] 6.2 Create Checkout Session API: For upgrading to Pro.
  - [ ] 6.3 Create Customer Portal API: For managing subscriptions.
  - [ ] 6.4 Implement "Gate":
    - Check subscription status before allowing "Publish" of >1 campaign.
    - Middleware/Server-side check to restrict access to Pro features.
  - [ ] 6.5 Handle Stripe Webhooks (`invoice.payment_succeeded`, etc.) to update user status in Supabase.

