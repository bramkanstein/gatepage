'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Twitter, Youtube, User } from 'lucide-react'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    default_x_handle: '',
    default_yt_channel_id: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return

        setUser(authUser)

        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) throw error

        setFormData({
          full_name: profile.full_name || '',
          default_x_handle: profile.default_x_handle || '',
          default_yt_channel_id: profile.default_yt_channel_id || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          default_x_handle: formData.default_x_handle,
          default_yt_channel_id: formData.default_yt_channel_id
        })
        .eq('id', user.id)

      if (error) throw error
      alert('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile and default social handles.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Profile Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
            <User size={20} />
            <h3>Profile Information</h3>
          </div>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input value={user?.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-500">Email cannot be changed.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your Name"
              />
            </div>
          </div>
        </div>

        {/* Social Defaults */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
            <h3>Default Social Handles</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These values will pre-fill when you create new campaigns.
          </p>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="x_handle" className="flex items-center gap-2">
                <Twitter size={16} className="text-gray-400" />
                Default X Username
              </Label>
              <Input 
                id="x_handle"
                value={formData.default_x_handle}
                onChange={(e) => setFormData({ ...formData, default_x_handle: e.target.value })}
                placeholder="bramk"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="yt_id" className="flex items-center gap-2">
                <Youtube size={16} className="text-gray-400" />
                Default YouTube Channel ID
              </Label>
              <Input 
                id="yt_id"
                value={formData.default_yt_channel_id}
                onChange={(e) => setFormData({ ...formData, default_yt_channel_id: e.target.value })}
                placeholder="UC..."
              />
              <p className="text-xs text-gray-500">
                Starts with "UC". Not your handle.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  )
}

