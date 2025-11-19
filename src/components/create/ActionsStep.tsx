import React from 'react'
import { Plus, Trash2, Mail, Twitter, Youtube, Linkedin, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActionsStepProps {
  formData: any
  updateFormData: (data: any) => void
}

const TASK_TYPES = [
  { id: 'email', label: 'Collect Email', icon: Mail, defaultConfig: { verify: true } },
  { id: 'x_follow', label: 'Follow on X', icon: Twitter, defaultConfig: { username: '' } },
  { id: 'x_repost', label: 'Repost on X', icon: Twitter, defaultConfig: { tweetId: '' } },
  { id: 'linkedin_share', label: 'Share on LinkedIn', icon: Linkedin, defaultConfig: { url: '' } },
  { id: 'yt_subscribe', label: 'Subscribe on YouTube', icon: Youtube, defaultConfig: { channelId: '' } },
]

export default function ActionsStep({ formData, updateFormData }: ActionsStepProps) {
  const tasks = formData.tasks || []

  const addTask = (typeId: string) => {
    const taskDef = TASK_TYPES.find(t => t.id === typeId)
    if (!taskDef) return

    const newTask = {
      id: crypto.randomUUID(),
      type: typeId,
      config: { ...taskDef.defaultConfig }
    }

    updateFormData({ tasks: [...tasks, newTask] })
  }

  const removeTask = (taskId: string) => {
    updateFormData({ tasks: tasks.filter((t: any) => t.id !== taskId) })
  }

  const updateTaskConfig = (taskId: string, key: string, value: any) => {
    const newTasks = tasks.map((t: any) => {
      if (t.id === taskId) {
        return { ...t, config: { ...t.config, [key]: value } }
      }
      return t
    })
    updateFormData({ tasks: newTasks })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Required Actions</h2>
        <p className="text-sm text-gray-500">What must users do to unlock your content?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {TASK_TYPES.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            className="h-auto py-3 flex flex-col gap-2 items-center justify-center hover:border-blue-500 hover:bg-blue-50"
            onClick={() => addTask(type.id)}
          >
            <type.icon size={20} />
            <span>{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Active Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            No actions added yet. Click above to add one.
          </div>
        )}

        {tasks.map((task: any, index: number) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 shadow-sm">
            <div className="mt-1 text-gray-400 font-mono text-sm">#{index + 1}</div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2 capitalize">
                   {TASK_TYPES.find(t => t.id === task.type)?.label}
                </span>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Configuration Fields based on Type */}
              <div className="grid gap-2">
                {task.type === 'x_follow' && (
                  <div className="grid gap-1">
                    <Label className="text-xs">X Username (without @)</Label>
                    <Input 
                      value={task.config.username}
                      onChange={(e) => updateTaskConfig(task.id, 'username', e.target.value)}
                      placeholder="e.g. bramk"
                      className="h-8"
                    />
                  </div>
                )}
                {task.type === 'x_repost' && (
                  <div className="grid gap-1">
                     <Label className="text-xs">Tweet ID or URL</Label>
                     <Input 
                       value={task.config.tweetId}
                       onChange={(e) => updateTaskConfig(task.id, 'tweetId', e.target.value)}
                       placeholder="1234567890..."
                       className="h-8"
                     />
                  </div>
                )}
                {task.type === 'yt_subscribe' && (
                   <div className="grid gap-1">
                     <div className="flex items-center gap-2">
                       <Label className="text-xs">Channel ID</Label>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <HelpCircle size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                           </TooltipTrigger>
                           <TooltipContent>
                             <p className="max-w-xs">
                               This is NOT your username. It starts with "UC". 
                               <a 
                                 href="https://www.youtube.com/account_advanced" 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="underline text-blue-400 ml-1"
                               >
                                 Find it here
                               </a>
                             </p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                     <Input 
                       value={task.config.channelId}
                       onChange={(e) => updateTaskConfig(task.id, 'channelId', e.target.value)}
                       placeholder="UC..."
                       className="h-8"
                     />
                   </div>
                )}
                {task.type === 'linkedin_share' && (
                   <div className="grid gap-1">
                     <Label className="text-xs">URL to Share</Label>
                     <Input 
                       value={task.config.url}
                       onChange={(e) => updateTaskConfig(task.id, 'url', e.target.value)}
                       placeholder="https://..."
                       className="h-8"
                     />
                   </div>
                )}
                {task.type === 'email' && (
                   <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                     Users must enter and verify their email address.
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

