'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Mail, Twitter, Youtube, Linkedin, Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [tasks, setTasks] = useState<Task[]>(campaign.tasks || [])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)

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

  const handleTaskClick = async (task: Task) => {
    if (task.status === 'completed') return

    // Update task to loading
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, status: 'loading' as const } : t
    )
    setTasks(updatedTasks)
    saveProgress(updatedTasks, false)

    // TODO: Call verification API based on task type
    // For now, simulate completion after 2 seconds
    setTimeout(() => {
      const completedTasks = updatedTasks.map(t => 
        t.id === task.id ? { ...t, status: 'completed' as const } : t
      )
      setTasks(completedTasks)
      saveProgress(completedTasks, false)
    }, 2000)
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

              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  disabled={isCompleted || isLoading}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'border-green-200 bg-green-50 cursor-default'
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
                      <Icon className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{label}</div>
                    {task.config?.username && (
                      <div className="text-sm text-gray-500">@{task.config.username}</div>
                    )}
                  </div>
                  {!isCompleted && !isLoading && (
                    <div className="text-sm text-blue-600 font-medium">Start →</div>
                  )}
                </button>
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

