import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GatePageClient from '@/components/gatepage/GatePageClient'

interface PageProps {
  params: Promise<{
    creatorSlug: string
    campaignSlug: string
  }>
}

export default async function PublicGatePage({ params }: PageProps) {
  const { campaignSlug } = await params
  const supabase = await createClient()
  
  // TODO: Fetch campaign by slug from Supabase
  // For now, return mock data structure for UI testing
  const campaign = null // await fetchCampaignBySlug(campaignSlug)
  
  if (!campaign) {
    notFound()
  }

  return <GatePageClient campaign={campaign} />
}

