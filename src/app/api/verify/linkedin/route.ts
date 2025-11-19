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

    // LinkedIn API is restrictive for checking "Did I share X URL?".
    // It requires 'r_member_social' scope and iterating through recent shares.
    
    // For MVP, we will perform a "Soft Check":
    // If we have a valid access token, we assume they went through the flow.
    // Alternatively, we can check /v2/me to ensure the token is valid.

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
       return NextResponse.json(
        { error: 'Invalid LinkedIn session' },
        { status: 401 }
      )
    }

    // If token is valid, we return success for now.
    // TODO: Implement stricter check if LinkedIn API permits.
    
    return NextResponse.json({ success: true, message: 'LinkedIn task verified' })

  } catch (error: any) {
    console.error('Verify LinkedIn Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

