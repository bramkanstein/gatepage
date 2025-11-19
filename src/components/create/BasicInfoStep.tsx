import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BasicInfoProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function BasicInfoStep({ formData, updateFormData }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Campaign Basics</h2>
        <p className="text-sm text-gray-500">Start by naming your campaign and defining its public URL.</p>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Campaign Title</Label>
          <Input
            id="title"
            placeholder="e.g. Exclusive E-Book Access"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Public URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
              gatepage.io/your-name/
            </span>
            <Input
              id="slug"
              placeholder="my-campaign-slug"
              value={formData.slug}
              onChange={(e) => updateFormData({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what users will get..."
            rows={4}
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

