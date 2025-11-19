## Relevant Files

- `src/middleware.ts` - Main middleware file for route protection.
- `src/app/login/page.tsx` - Login page to update Google Auth logic.
- `src/app/dashboard/settings/page.tsx` - New settings page.
- `src/components/create/BasicInfoStep.tsx` - To update file upload logic.
- `src/components/create/ActionsStep.tsx` - To verify verification logic.
- `src/app/api/upload/route.ts` - (Optional) Server-side upload handler if using Presigned URLs, or client-side logic in `BasicInfoStep`.
- `supabase/schema.sql` - To verify storage buckets policies (might need new policy for uploads).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/missing-gaps`)

- [x] 1.0 Implement Route Protection
  - [x] 1.1 Update `src/middleware.ts` to check for Supabase session.
  - [x] 1.2 Define protected routes (`/dashboard`, `/dashboard/*`) and public routes (`/login`, `/`, `/[slug]/[slug]`).
  - [x] 1.3 Redirect unauthenticated users from protected routes to `/login`.
  - [x] 1.4 Redirect authenticated users from `/login` to `/dashboard`.

- [ ] 2.0 Enable Google Authentication
  - [ ] 2.1 Verify `src/app/login/page.tsx` Google Auth handler uses correct `signInWithOAuth` provider ('google').
  - [ ] 2.2 Add "Google" to Supabase Dashboard -> Authentication -> Providers (Instructional step for user: "Please enable Google in Supabase and add Client ID/Secret").
  - [ ] 2.3 Test Google Sign In flow (requires user config).

- [ ] 3.0 Implement File Uploads
  - [ ] 3.1 Create "campaign_files" bucket in Supabase Storage (via Dashboard or SQL if possible, usually Dashboard).
  - [ ] 3.2 Add RLS policy for "campaign_files" bucket: Public read, Authenticated upload.
  - [ ] 3.3 Update `src/components/create/BasicInfoStep.tsx`:
    - [ ] 3.3.1 Implement `uploadFile` function using `supabase.storage`.
    - [ ] 3.3.2 Handle upload progress and state.
    - [ ] 3.3.3 Return public URL of uploaded file.
    - [ ] 3.3.4 Save file path/URL to `formData`.

- [ ] 4.0 Create User Settings Page
  - [ ] 4.1 Create `src/app/dashboard/settings/page.tsx`.
  - [ ] 4.2 Implement UI: Form to edit Name, Avatar (optional), Default X Handle, Default YouTube Channel ID.
  - [ ] 4.3 Fetch existing user profile data on load.
  - [ ] 4.4 Implement "Save" functionality to update `users` table.
    - *Note:* We may need to add columns to `users` table (`default_x_handle`, `default_yt_channel_id`) if they don't exist.
  - [ ] 4.5 Add "Settings" link to `src/app/dashboard/layout.tsx` sidebar.

- [ ] 5.0 Refine Social Verification (Strict Mode Preparation)
  - [ ] 5.1 Review `src/app/api/verify/x/route.ts` and add TODO comments for where the specific X API call goes.
  - [ ] 5.2 Review `src/app/api/verify/youtube/route.ts` and ensure it handles errors gracefully.
  - [ ] 5.3 Review `src/app/api/verify/linkedin/route.ts`.

