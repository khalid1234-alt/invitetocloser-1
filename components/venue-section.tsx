'use client'

import { MapPin, Navigation } from 'lucide-react'
import { SectionTitle } from '@/components/ornament'
import { Reveal } from '@/components/reveal'
import { useInvitation } from '@/lib/invitation-context'

export function VenueSection() {
  const { invitation, mapDirectionsUrl, mapEmbedUrl } = useInvitation()
  return (
    <section className="px-6 py-14">
      <div className="mx-auto flex max-w-md flex-col items-center gap-8">
        <Reveal className="w-full">
          <SectionTitle eyebrow="Location" title="The Venue" />
        </Reveal>

        <Reveal delay={120} className="w-full">
          <div className="overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-[0_18px_50px_-26px_oklch(0.42_0.062_62/45%)]">
            <img
              src="/images/venue.png"
              alt={`Decorated reception hall at ${invitation.venue.name}`}
              className="h-44 w-full object-cover"
            />

            <div className="flex flex-col items-center gap-2 px-6 py-6 text-center">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              <h3 className="gold-text font-script text-3xl leading-tight">
                {invitation.venue.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {invitation.venue.address}
              </p>
            </div>

            <div className="border-t border-primary/25">
              <iframe
                title={`Map showing ${invitation.venue.name}`}
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-56 w-full border-0"
              />
            </div>

            <div className="p-4">
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm tracking-[0.22em] text-secondary-foreground uppercase transition-colors hover:bg-secondary/90"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Get Directions
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
