import React, { useState } from 'react'
import { ChevronRight, Check, Layout, ListTodo, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Placeholder components for steps
import BasicInfoStep from '@/components/create/BasicInfoStep'
import ActionsStep from '@/components/create/ActionsStep'
import DeliveryStep from '@/components/create/DeliveryStep'

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Layout },
  { id: 'actions', title: 'Actions', icon: ListTodo },
  { id: 'delivery', title: 'Reward', icon: Gift },
]

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Form State (Simplified for MVP)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    tasks: [],
    deliveryMethod: 'reveal',
    destinationUrl: '',
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    console.log('Submitting Campaign:', formData)
    // TODO: Call Supabase Insert
    setTimeout(() => setIsLoading(false), 1000)
  }

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const CurrentStepComponent = [
    BasicInfoStep,
    ActionsStep,
    DeliveryStep
  ][currentStep]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-500">Set up your gate in 3 simple steps.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index
          const isCurrent = currentStep === index
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-gray-50 px-4">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted || isCurrent 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
              </div>
              <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 min-h-[400px]">
        <CurrentStepComponent formData={formData} updateFormData={updateFormData} />
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 0 || isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {currentStep === STEPS.length - 1 ? (isLoading ? 'Creating...' : 'Publish Campaign') : 'Continue'}
          {!isLoading && currentStep !== STEPS.length - 1 && <ChevronRight size={18} className="ml-2" />}
        </Button>
      </div>
    </div>
  )
}

