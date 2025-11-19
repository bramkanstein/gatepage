import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon, Mail, Eye } from 'lucide-react'

interface DeliveryStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function DeliveryStep({ formData, updateFormData }: DeliveryStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Reward Delivery</h2>
        <p className="text-sm text-gray-500">How should users receive their reward?</p>
      </div>

      {/* Delivery Method */}
      <div className="space-y-4">
        <Label>Delivery Method</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.deliveryMethod === 'reveal' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ deliveryMethod: 'reveal' })}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Eye size={18} className={formData.deliveryMethod === 'reveal' ? 'text-blue-600' : 'text-gray-500'} />
              Reveal on Page
            </div>
            <p className="text-sm text-gray-500">Show a button immediately after completion.</p>
          </button>

          <button
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              formData.deliveryMethod === 'email' 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => updateFormData({ deliveryMethod: 'email' })}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Mail size={18} className={formData.deliveryMethod === 'email' ? 'text-blue-600' : 'text-gray-500'} />
              Send via Email
            </div>
            <p className="text-sm text-gray-500">Email the link/file (Requires Email Task).</p>
          </button>
        </div>
      </div>

      {/* Destination Content */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <Label>Destination Content</Label>
        
        <div className="flex gap-4 mb-4">
           <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
             Link URL
           </button>
           <button className="text-sm font-medium text-gray-500 hover:text-gray-700 pb-1 disabled:opacity-50" disabled>
             File Upload (Coming Soon)
           </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinationUrl">Target URL</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              id="destinationUrl"
              placeholder="https://dropbox.com/my-file..."
              className="pl-10"
              value={formData.destinationUrl}
              onChange={(e) => updateFormData({ destinationUrl: e.target.value })}
            />
          </div>
          <p className="text-xs text-gray-500">
            Users will be redirected here or see this link button.
          </p>
        </div>
      </div>
    </div>
  )
}

