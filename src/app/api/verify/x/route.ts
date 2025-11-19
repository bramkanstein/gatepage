import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, taskConfig, taskType } = await request.json()

    if (!accessToken || !taskConfig) {
      return NextResponse.json(
        { error: 'Missing access token or configuration' },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------------
    // STRICT VERIFICATION PLAN (Future Implementation)
    // ------------------------------------------------------------------
    // To enable strict verification (actually checking if they followed/liked):
    // 1. Upgrade X API to Basic Tier ($100/mo) or Pro.
    // 2. Request scopes: `users.read`, `tweet.read`, `follows.read`, `like.read`.
    // 3. Use endpoints:
    //    - Follow: GET /2/users/:id/following (Check if target_id is in list)
    //    - Like: GET /2/users/:id/liked_tweets (Check if tweet_id is in list)
    //    - Repost: GET /2/users/:id/retweets (Check if tweet_id is in list)
    // ------------------------------------------------------------------

    // ------------------------------------------------------------------
    // MVP / SOFT VERIFICATION (Current Implementation)
    // ------------------------------------------------------------------
    // We assume "Ownership Check". If the user successfully authenticated
    // via OAuth and provided a valid token, we count the task as done.
    // This is a common pattern for free tools to avoid high API costs.
    
    // Validate the token works (optional but recommended)
    const meRes = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    
    if (!meRes.ok) {
      // Token is invalid or expired
      return NextResponse.json(
        { error: 'Invalid X session. Please reconnect.' },
        { status: 401 }
      )
    }

    console.log(`[Soft Verify] X task: ${taskType} verified for config:`, taskConfig)

    return NextResponse.json({ success: true, message: 'X task verified' })

  } catch (error: any) {
    console.error('Verify X Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
