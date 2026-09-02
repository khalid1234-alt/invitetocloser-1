'use client'

import { useEffect, useState } from 'react'
import { LocationPicker, type SelectedLocation } from '@/components/location-picker'
import { invitation as defaultInvitation } from '@/lib/invitation-data'

type FormState = {
  id: string
  groom: string
  bride: string
  occasion: string
  hosts: string
  date: string
  time: string
  timeNote: string
  venueName: string
  venueAddress: string
  lat: string
  lon: string
  contactDisplay: string
  contactTel: string
  whatsapp: string
}

const emptyForm: FormState = {
  id: '',
  groom: defaultInvitation.groom,
  bride: defaultInvitation.bride,
  occasion: defaultInvitation.occasion,
  hosts: defaultInvitation.hosts,
  date: '2026-11-27',
  time: '19:00',
  timeNote: 'Dinner Onwards',
  venueName: defaultInvitation.venue.name,
  venueAddress: defaultInvitation.venue.address,
  lat: String(defaultInvitation.venue.lat),
  lon: String(defaultInvitation.venue.lon),
  contactDisplay: defaultInvitation.contact.display,
  contactTel: defaultInvitation.contact.tel,
  whatsapp: defaultInvitation.contact.whatsapp,
}

export function InvitationDashboard() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)
  const [previewId, setPreviewId] = useState('')
  const [status, setStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const hasLocation = Boolean(form.venueAddress || form.lat || form.lon)
    if (!hasLocation) {
      setSelectedLocation(null)
      return
    }

    setSelectedLocation({
      name: form.venueName || form.venueAddress.split(',')[0] || 'Venue',
      address: form.venueAddress,
      lat: Number(form.lat) || 0,
      lon: Number(form.lon) || 0,
    })
  }, [form.lat, form.lon, form.venueAddress, form.venueName])

  useEffect(() => {
    async function loadInvitation() {
      try {
        const response = await fetch('/api/invitation')
        const records = await response.json() as Array<{ id: string; groom?: string; bride?: string; occasion?: string; hosts?: string; date?: string; venue?: { name?: string; address?: string; lat?: number; lon?: number }; contact?: { display?: string; tel?: string; whatsapp?: string }; startsAt?: string; time?: { label?: string; note?: string }; }>
        const saved = records[0]
        if (!saved) return

        const nextForm: FormState = {
          id: saved.id,
          groom: saved.groom ?? defaultInvitation.groom,
          bride: saved.bride ?? defaultInvitation.bride,
          occasion: saved.occasion ?? defaultInvitation.occasion,
          hosts: saved.hosts ?? defaultInvitation.hosts,
          date: saved.startsAt?.slice(0, 10) ?? '2026-11-27',
          time: saved.startsAt?.slice(11, 16) ?? '19:00',
          timeNote: saved.time?.note ?? 'Dinner Onwards',
          venueName: saved.venue?.name ?? defaultInvitation.venue.name,
          venueAddress: saved.venue?.address ?? defaultInvitation.venue.address,
          lat: String(saved.venue?.lat ?? defaultInvitation.venue.lat),
          lon: String(saved.venue?.lon ?? defaultInvitation.venue.lon),
          contactDisplay: saved.contact?.display ?? defaultInvitation.contact.display,
          contactTel: saved.contact?.tel ?? defaultInvitation.contact.tel,
          whatsapp: saved.contact?.whatsapp ?? defaultInvitation.contact.whatsapp,
        }

        setForm(nextForm)
        setPreviewId(saved.id)
      } catch {
        setStatus('Using the default invitation until you save a new version.')
      }
    }

    void loadInvitation()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setStatus('')

    const venueLocation = selectedLocation ?? {
      name: form.venueName || form.venueAddress.split(',')[0] || 'Venue',
      address: form.venueAddress,
      lat: Number(form.lat),
      lon: Number(form.lon),
    }

    try {
      const response = await fetch('/api/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: form.id || undefined,
          venueName: venueLocation.name,
          venueAddress: venueLocation.address,
          lat: String(venueLocation.lat),
          lon: String(venueLocation.lon),
        }),
      })

      const data = await response.json() as { id?: string; error?: string }
      if (!response.ok || data.error) {
        setStatus(data.error || 'The invitation could not be saved.')
        return
      }

      const nextId = data.id ?? form.id
      if (nextId) {
        setForm((current) => ({ ...current, id: nextId }))
        window.location.href = `/preview?id=${nextId}`
        return
      }

      setStatus('The invitation was saved, but the preview ID was not returned.')
    } catch {
      setStatus('The backend save failed. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-2xl border border-primary/30 bg-card/80 p-5 shadow-xl backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-primary">Invitation Setup</p>
        <h1 className="mt-2 font-script text-4xl text-secondary">Create your invitation</h1>
      </div>

      {status && <p className="mb-4 rounded-xl border border-primary/20 bg-background/60 px-4 py-3 text-sm text-muted-foreground">{status}</p>}

      <section className="rounded-3xl border border-primary/30 bg-card/85 p-5 shadow-xl">
        <form id="invitation-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['groom', 'Groom name', 'text'],
              ['bride', 'Bride name', 'text'],
              ['occasion', 'Occasion', 'text'],
              ['hosts', 'Hosts', 'text'],
              ['date', 'Date', 'date'],
              ['time', 'Time', 'time'],
              ['venueName', 'Venue name', 'text'],
              ['contactDisplay', 'Contact display', 'text'],
              ['contactTel', 'Phone', 'text'],
              ['whatsapp', 'WhatsApp', 'text'],
            ].map(([name, label, type]) => (
              <label key={name} className={name === 'venueName' || name === 'contactDisplay' ? 'sm:col-span-2' : ''}>
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
                <input
                  value={form[name as keyof FormState]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  type={type}
                  className="w-full rounded-xl border border-primary/35 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            ))}

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Venue address</span>
              <textarea
                value={form.venueAddress}
                onChange={(event) => setForm((current) => ({ ...current, venueAddress: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-primary/35 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="sm:col-span-2">
              <LocationPicker
                value={selectedLocation}
                onChange={(nextLocation) => {
                  setSelectedLocation(nextLocation)
                  if (!nextLocation) return
                  setForm((current) => ({
                    ...current,
                    venueName: nextLocation.name,
                    venueAddress: nextLocation.address,
                    lat: String(nextLocation.lat),
                    lon: String(nextLocation.lon),
                  }))
                }}
              />
            </div>

            <label>
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Latitude</span>
              <input
                value={form.lat}
                onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))}
                type="number"
                step="any"
                className="w-full rounded-xl border border-primary/35 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Longitude</span>
              <input
                value={form.lon}
                onChange={(event) => setForm((current) => ({ ...current, lon: event.target.value }))}
                type="number"
                step="any"
                className="w-full rounded-xl border border-primary/35 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Time note</span>
              <input
                value={form.timeNote}
                onChange={(event) => setForm((current) => ({ ...current, timeNote: event.target.value }))}
                type="text"
                className="w-full rounded-xl border border-primary/35 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="rounded-full bg-secondary px-6 py-3 text-xs uppercase tracking-[0.22em] text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save & preview'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
