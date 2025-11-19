import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload, Link as LinkIcon, Mail, Eye, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeliveryStepProps {
  formData: any
  updateFormData: (data: any) => void
}

export default function DeliveryStep({ formData, updateFormData }: DeliveryStepProps) {
  const [inputType, setInputType] = useState<'url' | 'file'>(formData.filePath ? 'file' : 'url')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('campaign_files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign_files')
        .getPublicUrl(filePath)

      // Update form data with both the specific file path (for reference) and the public URL as the destination
      updateFormData({ 
        destinationUrl: publicUrl,
        filePath: filePath 
      })

    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

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
           <button 
             onClick={() => setInputType('url')}
             className={`text-sm font-medium pb-1 ${inputType === 'url' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Link URL
           </button>
           <button 
             onClick={() => setInputType('file')}
             className={`text-sm font-medium pb-1 ${inputType === 'file' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             File Upload
           </button>
        </div>

        {inputType === 'url' ? (
          <div className="space-y-2 animate-in fade-in">
            <Label htmlFor="destinationUrl">Target URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="destinationUrl"
                placeholder="https://dropbox.com/my-file..."
                className="pl-10"
                value={formData.destinationUrl}
                onChange={(e) => updateFormData({ destinationUrl: e.target.value, filePath: null })} // Clear file path if switching to URL manually
              />
            </div>
            <p className="text-xs text-gray-500">
              Users will be redirected here or see this link button.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <Label>Upload File</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                {isUploading ? (
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                ) : formData.filePath ? (
                  <CheckCircle2 className="text-green-600" size={32} />
                ) : (
                  <Upload className="text-gray-400" size={32} />
                )}
                
                <div className="text-sm font-medium text-gray-900">
                  {isUploading ? 'Uploading...' : formData.filePath ? 'File Uploaded' : 'Click to upload or drag and drop'}
                </div>
                
                {formData.filePath && (
                   <p className="text-xs text-green-600 truncate max-w-[200px]">{formData.filePath}</p>
                )}
                {!formData.filePath && !isUploading && (
                   <p className="text-xs text-gray-500">PDF, PNG, JPG, ZIP (Max 10MB)</p>
                )}
              </div>
            </div>
            {uploadError && (
              <p className="text-xs text-red-600">{uploadError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
