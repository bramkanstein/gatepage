'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Mail, Twitter, Youtube, Linkedin, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  type: string
  config: any
  status: 'pending' | 'loading' | 'completed'
}

interface Campaign {
  id: string
  title: string
  description: string
  destinationUrl: string
  deliveryMethod: 'reveal' | 'email' | 'both'
  tasks: Task[]
}

interface GatePageClientProps {
  campaign: Campaign
}

const TASK_ICONS: Record<string, any> = {
  email: Mail,
  x_follow: Twitter,
  x_repost: Twitter,
  x_like: Twitter,
  linkedin_share: Linkedin,
  yt_subscribe: Youtube,
}

const TASK_LABELS: Record<string, string> = {
  email: 'Verify Email',
  x_follow: 'Follow on X',
  x_repost: 'Repost on X',
  x_like: 'Like on X',
  linkedin_share: 'Share on LinkedIn',
  yt_subscribe: 'Subscribe on YouTube',
}

export default function GatePageClient({ campaign }: GatePageClientProps) {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>(campaign.tasks || [])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  
  // Email Verification State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Social Auth State
  const [socialUser, setSocialUser] = useState<any>(null)

  // Load guest session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`gatepage_${campaign.id}`)
    if (stored) {
      const data = JSON.parse(stored)
      setGuestId(data.guestId)
      setTasks(data.tasks || campaign.tasks || [])
      setIsUnlocked(data.isUnlocked || false)
    } else {
      // Generate new guest ID
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setGuestId(newGuestId)
      localStorage.setItem(`gatepage_${campaign.id}`, JSON.stringify({
        guestId: newGuestId,
        tasks: campaign.tasks || [],
        isUnlocked: false
      }))
    }
  }, [campaign.id, campaign.tasks])

  // Check for OAuth Callback (Supabase session)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setSocialUser(session.user)
        console.log('Social User:', session.user)
        
        // If we just came back from auth, try to verify tasks automatically
        // But wait for tasks to be loaded from local storage first
      }
    }
    checkSession()
  }, [supabase.auth])


  // Save progress to localStorage
  const saveProgress = (updatedTasks: Task[], unlocked: boolean) => {
    if (guestId) {
      localStorage.setItem(`gatepage_${campaign.id}`, JSON.stringify({
        guestId,
        tasks: updatedTasks,
        isUnlocked: unlocked
      }))
    }
  }

  // Check if all tasks are completed
  useEffect(() => {
    const allCompleted = tasks.every(t => t.status === 'completed')
    if (allCompleted && tasks.length > 0) {
      setIsUnlocked(true)
      saveProgress(tasks, true)
    }
  }, [tasks, campaign.id, guestId])

  const handleXLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        scopes: 'tweet.read users.read follows.read',
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`
      }
    })
    if (error) {
      alert('Error connecting to X: ' + error.message)
    }
  }

  const verifyXTask = async (task: Task) => {
    if (!socialUser) {
      handleXLogin()
      return
    }

    // Optimistic loading
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, status: 'loading' as const } : t
    )
    setTasks(updatedTasks)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/verify/x', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session?.provider_token, // Need to ensure we get provider token
          taskConfig: task.config,
          taskType: task.type
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Success
      const completedTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: 'completed' as const } : t
      )
      setTasks(completedTasks)
      saveProgress(completedTasks, false)
      setActiveTaskId(null)

    } catch (error: any) {
      console.error(error)
      alert('Verification failed: ' + error.message)
      // Revert loading state
      setTasks(tasks)
    }
  }

  const handleTaskClick = async (task: Task) => {
    if (task.status === 'completed') return

    // Handle Email Task
    if (task.type === 'email') {
      if (activeTaskId === task.id) {
        setActiveTaskId(null) // Toggle off
      } else {
        setActiveTaskId(task.id)
        setEmailStep('input')
        setEmail('')
        setOtp('')
      }
      return
    }

    // Handle X Tasks
    if (task.type.startsWith('x_')) {
      if (activeTaskId === task.id) {
        setActiveTaskId(null)
      } else {
        setActiveTaskId(task.id)
      }
      return
    }

    // Handle Other OAuth Tasks (YT, LinkedIn)
    // TODO: Implement OAuth flow using Supabase Auth or custom flow
    alert('This verification type requires configuration. Please complete other tasks first.')
  }

  const handleEmailSubmit = async (taskId: string) => {
    if (!email) return
    setIsVerifying(true)

    try {
      const res = await fetch('/api/verify/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          campaignId: campaign.id,
          taskId
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setEmailStep('verify')
    } catch (error: any) {
      alert(error.message || 'Failed to send code')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOtpSubmit = async (taskId: string) => {
    if (!otp) return
    setIsVerifying(true)

    try {
      const res = await fetch('/api/verify/email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otp,
          campaignId: campaign.id,
          taskId
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Success
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      )
      setTasks(updatedTasks)
      saveProgress(updatedTasks, false) // Check unlock happens in useEffect
      setActiveTaskId(null)

    } catch (error: any) {
      alert(error.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUnlock = () => {
    if (campaign.deliveryMethod === 'reveal' || campaign.deliveryMethod === 'both') {
      window.open(campaign.destinationUrl, '_blank')
    }
    // TODO: Trigger email delivery if needed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            {isUnlocked ? (
              <Unlock className="text-green-600" size={32} />
            ) : (
              <Lock className="text-gray-400" size={32} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-gray-600">{campaign.description}</p>
          )}
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Complete these actions to unlock:
          </h2>
          
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const Icon = TASK_ICONS[task.type] || Circle
              const label = TASK_LABELS[task.type] || task.type
              const isCompleted = task.status === 'completed'
              const isLoading = task.status === 'loading'
              const isActive = activeTaskId === task.id

              return (
                <div key={task.id} className="space-y-2">
                  <button
                    onClick={() => handleTaskClick(task)}
                    disabled={isCompleted || isLoading}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'border-green-200 bg-green-50 cursor-default'
                        : isActive
                        ? 'border-blue-500 bg-blue-50'
                        : isLoading
                        ? 'border-blue-200 bg-blue-50 cursor-wait'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-600" size={24} />
                      ) : isLoading ? (
                        <Loader2 className="text-blue-600 animate-spin" size={24} />
                      ) : (
                        <Icon className={isActive ? "text-blue-600" : "text-gray-400"} size={24} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{label}</div>
                      {task.config?.username && (
                        <div className="text-sm text-gray-500">@{task.config.username}</div>
                      )}
                    </div>
                    {!isCompleted && !isLoading && (
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-blue-600'}`}>
                        {isActive ? 'Close' : 'Start →'}
                      </div>
                    )}
                  </button>

                  {/* Expandable Content for X Task */}
                  {isActive && task.type.startsWith('x_') && (
                    <div className="p-4 border border-blue-100 bg-white rounded-lg shadow-sm animate-in slide-in-from-top-2">
                      {!socialUser ? (
                        <div className="text-center space-y-3">
                           <p className="text-sm text-gray-600">Connect your X account to verify this action.</p>
                           <Button 
                             onClick={handleXLogin}
                             className="w-full bg-black hover:bg-gray-800 text-white"
                           >
                             <Twitter size={16} className="mr-2" />
                             Connect X (Twitter)
                           </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                             <CheckCircle2 size={16} />
                             Connected as {socialUser.user_metadata.user_name || socialUser.email}
                           </div>
                           <Button 
                             onClick={() => verifyXTask(task)}
                             disabled={task.status === 'loading'}
                             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                           >
                             {task.status === 'loading' ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                             Verify Action
                           </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expandable Content for Email Task */}
                  {isActive && task.type === 'email' && (
                    <div className="p-4 border border-blue-100 bg-white rounded-lg shadow-sm animate-in slide-in-from-top-2">
                      {emailStep === 'input' ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Enter your email address</label>
                            <Input 
                              type="email" 
                              placeholder="name@example.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isVerifying}
                            />
                          </div>
                          <Button 
                            onClick={() => handleEmailSubmit(task.id)}
                            disabled={!email || isVerifying}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isVerifying ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Send Verification Code
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Enter the code sent to {email}</label>
                            <Input 
                              type="text" 
                              placeholder="123456" 
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              disabled={isVerifying}
                              className="text-center text-lg tracking-widest"
                              maxLength={6}
                            />
                          </div>
                          <Button 
                            onClick={() => handleOtpSubmit(task.id)}
                            disabled={!otp || isVerifying}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isVerifying ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Verify Code
                          </Button>
                          <button 
                            onClick={() => setEmailStep('input')}
                            className="w-full text-sm text-gray-500 hover:text-gray-700"
                          >
                            Change email
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Unlock Button */}
        {isUnlocked && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 text-center">
            <div className="mb-4">
              <CheckCircle2 className="text-green-600 mx-auto mb-2" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All tasks completed!</h3>
              <p className="text-gray-600">Your reward is ready.</p>
            </div>
            <Button
              onClick={handleUnlock}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {campaign.deliveryMethod === 'email' 
                ? 'Check Your Email' 
                : 'Access Your Reward →'}
            </Button>
          </div>
        )}

        {/* Progress Indicator */}
        {!isUnlocked && tasks.length > 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            {tasks.filter(t => t.status === 'completed').length} of {tasks.length} tasks completed
          </div>
        )}
      </div>
    </div>
  )
}

