# Product Requirements Document: GatePage Core Platform

## 1. Introduction/Overview
GatePage (formerly RelayPage) is a SaaS platform that allows digital entrepreneurs, creators, and brands to "gate" exclusive content behind a set of social actions. Instead of just asking for an email, creators can require users to "pay with engagement" (e.g., Follow on X, Subscribe on YouTube, Share on LinkedIn) to unlock a destination URL or download a file.

**Problem:** Creators struggle to grow social engagement and reach organically. Traditional lead magnets only capture emails but don't leverage the viral potential of social networks.
**Goal:** To build the easiest, most flexible platform for creating viral social campaigns that boost reach, followers, and leads simultaneously.

## 2. Goals
- **Growth:** Enable creators to grow their social following by 10-20% per campaign.
- **Engagement:** Drive authentic engagement (likes, shares) on specific posts.
- **Leads:** Capture verified email addresses alongside social actions.
- **Scarcity:** Provide tools (limits, timers) that increase conversion rates through FOMO.

## 3. User Stories

### The Creator (Campaign Builder)
- **US1:** As a creator, I want to create a "Gate" page in minutes so I can share my new resource immediately.
- **US2:** As a creator, I want to mix and match tasks (e.g., "Follow on X" AND "Subscribe to Newsletter") to maximize my growth.
- **US3:** As a creator, I want to upload a file (PDF) directly to GatePage and know it's secure until the user completes tasks.
- **US4:** As a creator, I want to set a limit (e.g., "Only 100 spots") so I can create urgency for my offer.
- **US5:** As a creator, I want to see who unlocked my content and export their emails.

### The Fan (Campaign Participant)
- **US6:** As a fan, I want to easily verify my actions (one-click login) without complex steps.
- **US7:** As a fan, I want immediate access to the reward after I finish the tasks.
- **US8:** As a fan, I want to know if a limited offer is still available before I start.

## 4. Functional Requirements

### 4.1 Campaign Creation (The "Relay" Engine)
1.  **Task Builder:**
    - Support for multiple task types: X (Follow, Like, Repost), YouTube (Subscribe), LinkedIn (Share), Email (Verify).
    - Drag-and-drop reordering of tasks.
    - "Hybrid" mode: Allow creators to select which tasks are mandatory vs. optional (future scope) or just a linear list (MVP).
2.  **Reward Configuration:**
    - **External Link:** Redirect user to a URL (Low Security).
    - **Hosted File:** Upload file to GatePage. Generate temporary/expiring download link upon unlock (High Security).
3.  **Scarcity & Limits:**
    - **Spot Limit:** Set a max number of unlocks (e.g., 100). Automatically close campaign when reached.
    - **Time Limit:** Set Start and End dates. Show "Coming Soon" before start and "Ended" after end.
    - **Countdown UI:** Display "X spots left" or "Time remaining" on the public page.

### 4.2 Task Verification System
1.  **Strict Mode (API Verified):**
    - Email: Send PIN/Magic Link (Already implemented).
    - YouTube: Check `subscriptions` API (Already implemented).
    - X (Future): Check `following` API (Requires Basic Tier).
2.  **Soft Mode (Honor System/Click-to-Confirm):**
    - Used for platforms with restrictive APIs (Instagram, TikTok, Free Tier X).
    - UI: "Click here to Follow" -> User returns -> "Did you follow?" (Yes/No).
    - *Note:* Essential for MVP viability on restrictive platforms.

### 4.3 Public Gate Page
1.  **Dynamic Rendering:** Page adapts based on Campaign Status (Active, Coming Soon, Ended/Sold Out).
2.  **Guest Identity:** Remember user progress in LocalStorage so they don't lose checked tasks on refresh.
3.  **Unlock Flow:**
    - If "Reveal": Show button/link on page.
    - If "Email": Send reward to the verified email address.

### 4.4 Dashboard & Analytics
1.  **Campaign Stats:** Views, Conversions (Unlocks), Drop-off rate.
2.  **Lead Management:** List of users who unlocked. Export to CSV.
3.  **User Settings:** Save default handles (X, YT) to speed up campaign creation.

## 5. Non-Goals (Out of Scope for now)
- **Payment Gating:** We are not building a Patreon competitor yet (though Stripe is used for *our* SaaS subscription).
- **Complex Logic:** No "If A then B" branching logic for tasks. Linear lists only.
- **Native Video Hosting:** We host files, but we aren't a video streaming platform.

## 6. Design Considerations
- **Mobile First:** 90% of social traffic is mobile. The "Unlock" button must be thumb-friendly.
- **Minimalist:** The content and the reward are the heroes. Remove distractions.
- **Inspiration:** Formcarry (clean, developer-friendly aesthetic), Linktree (simplicity).

## 7. Technical Considerations
- **X API Limitations:** The Free Tier of X API v2 only supports "Write" (posting) and "Login". It does *not* support "Read" (checking follows/likes) for free.
    - *Implication:* X verification must be "Soft" (Ownership check: "You logged in, we trust you followed") OR we must pay for Basic Tier ($100/mo) to offer "Strict" checks.
    - *Decision:* Support Soft Mode by default. Offer Strict Mode if *we* (GatePage) pay for the API or if the User connects *their* own Enterprise keys (unlikely for MVP).

## 8. Success Metrics
- **Conversion Rate:** % of visitors who complete all tasks.
- **Viral Coefficient:** K-factor (do unlockers share the campaign?).
- **Time-to-Publish:** Median time for a creator to build and launch a campaign (< 5 mins).

## 9. Open Questions
- **Instagram/TikTok:** These have no official public API for checking "Follows". We must rely purely on Soft Mode (click tracking) for these. Is that acceptable? (Answer: Yes, per User preference 2C/Hybrid).

