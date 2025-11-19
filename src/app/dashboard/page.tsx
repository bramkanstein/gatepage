'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, BarChart2, Users, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Campaign {
  id: string
  title: string
  slug: string
  status: string
  created_at: string
  views?: number // Placeholder for now
  leads_count?: number
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // Fetch campaigns with a count of leads
        // Note: Supabase 'count' is easier with a separate query or view, 
        // but for MVP we'll fetch campaigns and then maybe counting leads is a separate step or we use a join.
        // For simple MVP, let's just fetch campaigns first.
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            leads:leads(count)
          `)
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform data to include leads_count
        const formattedData = data.map((c: any) => ({
          ...c,
          leads_count: c.leads?.[0]?.count || 0,
          views: 0 // We don't track views yet
        }))

        setCampaigns(formattedData)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const handleExportLeads = async (campaignId: string, title: string) => {
    setIsExporting(campaignId)
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', campaignId)

      if (error) throw error

      if (!leads || leads.length === 0) {
        alert('No leads to export for this campaign.')
        return
      }

      // Convert to CSV
      const headers = ['Email', 'Status', 'Created At', 'Task Progress']
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          lead.email || 'Anonymous',
          lead.status,
          new Date(lead.created_at).toLocaleString(),
          JSON.stringify(lead.task_progress).replace(/,/g, ';') // Escape commas in JSON
        ].join(','))
      ].join('\n')

      // Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `leads_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error: any) {
      console.error('Export failed:', error)
      alert('Failed to export leads: ' + error.message)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Manage your gates and view performance.</p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus size={20} className="mr-2" />
            Create New Gate
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
            <BarChart2 className="text-blue-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first GatePage to start collecting leads and driving actions.
          </p>
          <Link href="/dashboard/create">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Create your first campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{campaign.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <a 
                    href={`/${campaign.slug}/preview`} // TODO: Actual public URL structure
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    /{campaign.slug}
                  </a>
                  <span>•</span>
                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-12 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign.leads_count}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Views</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => handleExportLeads(campaign.id, campaign.title)}
                    disabled={isExporting === campaign.id || campaign.leads_count === 0}
                  >
                    {isExporting === campaign.id ? (
                       <span className="animate-pulse">Exporting...</span>
                    ) : (
                       <>
                         <Download size={14} className="mr-2" />
                         CSV
                       </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

