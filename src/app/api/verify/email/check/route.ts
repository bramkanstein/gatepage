import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email, campaignId, taskId, code } = await request.json()

    if (!email || !campaignId || !taskId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Find Lead
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('email', email)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // 2. Verify Code
    const taskData = lead.task_progress?.[taskId]

    if (!taskData || !taskData.pin) {
      return NextResponse.json(
        { error: 'No verification pending for this task' },
        { status: 400 }
      )
    }

    if (taskData.pin !== code) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      )
    }

    if (new Date(taskData.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Code expired' },
        { status: 400 }
      )
    }

    // 3. Mark as Completed
    // We retain the history or just overwrite? Overwriting with status 'completed' is fine.
    const updatedTaskProgress = {
      ...lead.task_progress,
      [taskId]: 'completed' // Simple string or object?
    }
    // Note: In GatePageClient, we might expect an object or just check key existence. 
    // The schema comment says: `task_progress jsonb default '{}'::jsonb, -- e.g. { "task_id_1": "completed" }`
    // So setting it to "completed" string fits the schema example.

    const { error: updateError } = await supabase
      .from('leads')
      .update({ task_progress: updatedTaskProgress })
      .eq('id', lead.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'Email verified successfully' })

  } catch (error: any) {
    console.error('Verify Email Check Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

