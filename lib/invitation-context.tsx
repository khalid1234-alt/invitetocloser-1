'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { invitation as defaultInvitation } from '@/lib/invitation-data'

export type Invitation = {
  groom: string
  bride: string
  occasion: string
  hosts: string
  date: { weekday: string; day: string; month: string; year: string; full: string }
  time: { label: string; note: string }
  startsAt: string
  venue: { name: string; address: string; lat: number; lon: number }
  contact: typeof defaultInvitation.contact
}

type InvitationContextValue = {
  invitation: Invitation
  setInvitation: (value: Invitation) => void
  mapEmbedUrl: string
  mapDirectionsUrl: string
}

const InvitationContext = createContext<InvitationContextValue | null>(null)

function invitationFromParams(params: URLSearchParams): Invitation | null {
  const groom = params.get('groom')?.trim()
  const bride = params.get('bride')?.trim()
  const father = params.get('father')?.trim()
  const address = params.get('address')?.trim()
  const lat = Number(params.get('lat'))
  const lon = Number(params.get('lon'))
  const dateValue = params.get('date') || ''
  const timeValue = params.get('time') || ''
  if (!groom || !bride || !father || !address || !Number.isFinite(lat) || !Number.isFinite(lon) || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || !/^\d{2}:\d{2}$/.test(timeValue)) return null

  const date = new Date(`${dateValue}T12:00:00`)
  const time = new Date(`1970-01-01T${timeValue}:00`)
  if (Number.isNaN(date.getTime()) || Number.isNaN(time.getTime())) return null
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const label = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return {
    ...defaultInvitation,
    groom,
    bride,
    hosts: `The Family of Mr. ${father}`,
    date: { weekday, day: dateValue.slice(8, 10), month, year: dateValue.slice(0, 4), full: `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}` },
    time: { label, note: 'Dinner Onwards' },
    startsAt: `${dateValue}T${timeValue}:00`,
    venue: { name: address.split(',')[0], address, lat, lon },
  }
}

export function InvitationProvider({
  children,
  initialInvitation,
}: {
  children: ReactNode
  initialInvitation?: Invitation
}) {
  const [currentInvitation, setCurrentInvitation] = useState<Invitation>(initialInvitation ?? defaultInvitation)

  useEffect(() => {
    const fromUrl = invitationFromParams(new URLSearchParams(window.location.search))
    if (fromUrl) {
      setCurrentInvitation(fromUrl)
      return
    }
    if (initialInvitation) {
      setCurrentInvitation(initialInvitation)
    }
  }, [initialInvitation])

  const value = useMemo(() => {
    const { lat, lon } = currentInvitation.venue
    const d = 0.02
    const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2].join('%2C')
    return {
      invitation: currentInvitation,
      setInvitation: setCurrentInvitation,
      mapEmbedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`,
      mapDirectionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentInvitation.venue.name}, ${currentInvitation.venue.address}`)}`,
    }
  }, [currentInvitation])

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>
}

export function useInvitation() {
  const value = useContext(InvitationContext)
  if (!value) throw new Error('useInvitation must be used within InvitationProvider')
  return value
}