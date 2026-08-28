'use client'

import { MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export type SelectedLocation = {
  name: string
  address: string
  lat: number
  lon: number
}

type SearchResult = SelectedLocation & { id: string; label: string }

export function LocationPicker({
  value,
  onChange,
}: {
  value: SelectedLocation | null
  onChange: (location: SelectedLocation | null) => void
}) {
  const [query, setQuery] = useState(value?.address || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const search = query.trim()
    if (search.length < 3 || value?.address === search) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(search)}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Location search failed')
        const data = (await response.json()) as Array<{
          place_id: number
          display_name: string
          lat: string
          lon: string
          name?: string
        }>
        setResults(
          data.map((place) => ({
            id: String(place.place_id),
            name: place.name || place.display_name.split(',')[0],
            address: place.display_name,
            label: place.display_name,
            lat: Number(place.lat),
            lon: Number(place.lon),
          })),
        )
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') setError('Could not search locations right now.')
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, value?.address])

  const choose = (location: SearchResult) => {
    onChange({ name: location.name, address: location.address, lat: location.lat, lon: location.lon })
    setQuery(location.address)
    setResults([])
  }

  const previewUrl = value
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${value.lon - 0.02}%2C${value.lat - 0.01}%2C${value.lon + 0.02}%2C${value.lat + 0.01}&layer=mapnik&marker=${value.lat}%2C${value.lon}`
    : null

  return (
    <div className="sm:col-span-2">
      <label htmlFor="address" className="mb-1.5 block text-xs tracking-[0.16em] text-muted-foreground uppercase">
        Search and choose location
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-4 text-primary" aria-hidden="true" />
        <input
          id="address"
          name="address"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (value) onChange(null)
          }}
          placeholder="Venue, street, city or landmark"
          required
          autoComplete="street-address"
          className="w-full rounded-lg border border-primary/35 bg-background/70 py-2.5 pl-10 pr-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
        {loading && <span className="absolute right-3 top-3 text-xs text-muted-foreground">Searching...</span>}
      </div>
      {results.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-lg border border-primary/35 bg-background shadow-lg">
          {results.map((result) => (
            <button key={result.id} type="button" onClick={() => choose(result)} className="flex w-full items-start gap-2 border-b border-primary/15 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{result.label}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {value && previewUrl && (
        <div className="mt-3 overflow-hidden rounded-lg border border-primary/25">
          <iframe title={`Map preview for ${value.name}`} src={previewUrl} loading="lazy" className="h-36 w-full border-0" />
          <p className="flex items-center gap-1.5 border-t border-primary/20 px-3 py-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" /> Selected: {value.name}
          </p>
        </div>
      )}
      {!value && <p className="mt-1.5 text-xs text-muted-foreground">Choose a search result to place it on the invitation map.</p>}
      <input type="hidden" name="latitude" value={value?.lat ?? ''} />
      <input type="hidden" name="longitude" value={value?.lon ?? ''} />
    </div>
  )
}