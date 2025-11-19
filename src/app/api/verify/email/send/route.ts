import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const resend = new Resend(apiKey)
    const { email, campaignId, taskId } = await request.json()

    if (!email || !campaignId || !taskId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Generate PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString() // 15 mins

    // 2. Check if lead exists for this campaign + email
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('email', email)
      .single()

    let leadId = existingLead?.id
    let taskProgress = existingLead?.task_progress || {}

    // 3. Update or Create Lead
    if (existingLead) {
      // Update existing lead
      taskProgress[taskId] = {
        status: 'pending',
        pin,
        expiresAt
      }

      const { error: updateError } = await supabase
        .from('leads')
        .update({ task_progress: taskProgress })
        .eq('id', leadId)

      if (updateError) throw updateError
    } else {
      // Create new lead
      taskProgress = {
        [taskId]: {
          status: 'pending',
          pin,
          expiresAt
        }
      }

      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          campaign_id: campaignId,
          email,
          task_progress: taskProgress,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError
      leadId = newLead.id
    }

    // 4. Send Email
    // Note: 'onboarding@resend.dev' is for testing. User should configure their domain.
    // Using process.env.RESEND_FROM_EMAIL or fallback.
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your Verification Code',
      html: `<p>Your verification code is: <strong>${pin}</strong></p><p>It expires in 15 minutes.</p>`
    })

    if (emailError) {
      console.error('Resend Error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' })

  } catch (error: any) {
    console.error('Verify Email Send Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

