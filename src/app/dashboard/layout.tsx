'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, LogOut, Sparkles, Loader2, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isPro, setIsPro] = useState(false)

  // Check subscription status
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('billing_status')
          .eq('id', user.id)
          .single()
        
        if (data?.billing_status === 'pro') {
          setIsPro(true)
        }
      }
    }
    checkStatus()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email
        })
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Something went wrong')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <span>GatePage</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
          >
            <LayoutDashboard size={18} />
            Campaigns
          </Link>
          <Link 
            href="/dashboard/create" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
          >
            <PlusCircle size={18} />
            New Campaign
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-blue-600"
          >
            <Settings size={18} />
            Settings
          </Link>
        </nav>

        <div className="p-4 space-y-4 border-t border-gray-100">
          {!isPro && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
                <Sparkles size={16} />
                <span>Upgrade to Pro</span>
              </div>
              <p className="text-xs text-blue-600 mb-3">
                Unlock unlimited campaigns and removal of branding.
              </p>
              <Button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpgrading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                Upgrade
              </Button>
            </div>
          )}

          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:text-red-600 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
