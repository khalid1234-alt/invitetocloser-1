'use client '

import { ClosingSection } from '@/components/closing-section'
import { ContactSection } from '@/components/contact-section'
import { DateSection } from '@/components/date-section'
import { DuaSection } from '@/components/dua-section'
import { HeroInvite } from '@/components/hero-invite'
import { OpenGate } from '@/components/open-gate'
import { VenueSection } from '@/components/venue-section'
import { VerseSection } from '@/components/verse-section'
import { InvitationProvider } from '@/lib/invitation-context'
import type { Invitation } from '@/lib/invitation-context'

export function InvitationPreview({ initialInvitation }: { initialInvitation?: Invitation }) {
  return (
    <InvitationProvider initialInvitation={initialInvitation}>
      <OpenGate autoPlay startStage="idle" />
      <div className="paper-bg  relative min-h-screen w-full overflow-x-hidden">
        <div className="fixed-bg" aria-hidden="true" />
        <div className="fixed-bg-veil" aria-hidden="true" />
        <main className="relative z-10 mx-auto w-full max-w-2xl">
          <HeroInvite />
          <VerseSection />
          <DateSection />
          <VenueSection />
          <DuaSection />
          <ContactSection />
          <ClosingSection /> 
        </main>
      </div>
    </InvitationProvider>
  )
}
