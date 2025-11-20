## Relevant Files

- `supabase/schema.sql` - SQL Migration for new columns (`max_spots`, `start_date`, `end_date`, `spots_used`).
- `src/components/create/BasicInfoStep.tsx` - UI for configuring Scarcity limits (Start/End Date, Spot Limit).
- `src/app/[creatorSlug]/[campaignSlug]/page.tsx` - Logic to check limits/dates and show "Coming Soon" / "Sold Out" states.
- `src/components/gatepage/GatePageClient.tsx` - Update UI to support new "Active" social actions (Follow/Share buttons).
- `src/app/api/verify/x/route.ts` - Enhance to support "Follow" action via API (if scope allows).
- `src/app/api/verify/linkedin/route.ts` - Enhance to support "Share" action via API (if scope allows).
- `src/app/api/download/route.ts` - New route for generating signed/expiring URLs for files.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Introduction
This task list covers the implementation of "Scarcity Features" (Limits & Dates) and "Active Social Actions" (Active Follow/Share) to complete the Core MVP vision for GatePage. We will also secure file downloads with expiring links.

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch `feature/scarcity-and-social-actions`

- [ ] 1.0 Implement Campaign Scarcity (Limits & Dates)
  - [ ] 1.1 Update `supabase/schema.sql` to add `max_spots` (int), `spots_used` (int, default 0), `start_date` (timestamptz), `end_date` (timestamptz) to `campaigns` table.
  - [ ] 1.2 Update `BasicInfoStep.tsx` to include form fields for these new limits.
  - [ ] 1.3 Update `src/app/dashboard/create/page.tsx` (Wizard) to save these fields to Supabase.
  - [ ] 1.4 Update Public Page (`[creatorSlug]/[campaignSlug]/page.tsx`) logic:
    - [ ] 1.4.1 Check `start_date`: If future, show "Coming Soon" state (Simple UI).
    - [ ] 1.4.2 Check `end_date`: If past, show "Campaign Ended".
    - [ ] 1.4.3 Check `spots_used >= max_spots`: If true, show "Sold Out".
    - [ ] 1.4.4 If active, render normal GatePage.

- [ ] 2.0 Implement "Active" Social Actions (X & LinkedIn)
  - [ ] 2.1 LinkedIn: Update `GatePageClient` to show "Share on LinkedIn" button (if LinkedIn task exists).
  - [ ] 2.2 LinkedIn: Update `/api/verify/linkedin` to accept a POST request that *triggers* the share via API (using `ugcPosts` if possible, or fallback to manual share + check). *Note: strict share creation requires `w_member_social` scope.*
  - [ ] 2.3 X (Twitter): Update `GatePageClient` to show "Follow on X" button.
  - [ ] 2.4 X (Twitter): Update `/api/verify/x` to attempt `follows.write` action if scope permits (check Free Tier limits).

- [ ] 3.0 Implement Expiring Links for Files
  - [ ] 3.1 Create `/api/download` route.
  - [ ] 3.2 Logic: Receive `campaign_id` + `file_path`. Verify user completed tasks (check `leads` table or session).
  - [ ] 3.3 Generate Signed URL from Supabase Storage (`createSignedUrl(path, 60)`).
  - [ ] 3.4 Return signed URL to frontend to trigger download.
  - [ ] 3.5 Update `GatePageClient` "Unlock" button to call this API instead of using the public raw URL.

