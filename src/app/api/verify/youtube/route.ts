import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken, taskConfig } = await request.json()
    const { channelId } = taskConfig

    if (!accessToken || !channelId) {
      return NextResponse.json(
        { error: 'Missing access token or channel ID' },
        { status: 400 }
      )
    }

    // Verify Subscription using YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${channelId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('YouTube API Error:', data)
      return NextResponse.json(
        { error: 'Failed to verify YouTube subscription' },
        { status: response.status }
      )
    }

    // Check if items array has entry (meaning they are subscribed)
    const isSubscribed = data.items && data.items.length > 0

    if (isSubscribed) {
      return NextResponse.json({ success: true, message: 'Subscription verified' })
    } else {
      return NextResponse.json(
        { error: 'User is not subscribed to the channel' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Verify YouTube Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

