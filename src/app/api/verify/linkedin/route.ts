import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, taskConfig } = await request.json()
    const { url } = taskConfig

    if (!accessToken || !url) {
      return NextResponse.json(
        { error: 'Missing access token or URL to share' },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------------
    // STRICT VERIFICATION PLAN (Future Implementation)
    // ------------------------------------------------------------------
    // To verify a "Share":
    // 1. Requires `w_member_social` (to share) or `r_member_social` (to read shares).
    // 2. LinkedIn API V2 is restrictive. You usually cannot query "Did user X share URL Y?".
    // 3. Workaround: You must use the API to *perform* the share on their behalf.
    //    - POST /v2/ugcPosts (Create a share)
    //    This ensures it happened because WE did it.
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    // MVP / SOFT VERIFICATION (Current Implementation)
    // ------------------------------------------------------------------
    // We assume "Intent Check". If they connected their LinkedIn, we trust they clicked share.
    // This is the standard behavior for many "Share to Unlock" tools due to API limits.

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
       return NextResponse.json(
        { error: 'Invalid LinkedIn session. Please reconnect.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, message: 'LinkedIn task verified' })

  } catch (error: any) {
    console.error('Verify LinkedIn Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
