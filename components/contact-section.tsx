'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { Ornament } from '@/components/ornament'
import { Reveal } from '@/components/reveal'
import { useInvitation } from '@/lib/invitation-context'

export function ContactSection() {
  const { invitation } = useInvitation()
  return (
    <section className="px-6 py-14">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <Reveal className="w-full">
          <Ornament />
        </Reveal>

        <Reveal delay={100}>
          <p className="text-[0.65rem] tracking-[0.42em] text-primary uppercase">
            For any assistance
          </p>
        </Reveal>

        <Reveal delay={180} className="w-full">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/40 bg-card/80 px-6 py-8">
            <h3 className="gold-text font-script text-3xl">Contact</h3>
            <p className="font-sans text-2xl tracking-[0.1em] gold-text">
              {invitation.contact.display}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`tel:${invitation.contact.tel}`}
                className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-xs tracking-[0.22em] text-secondary-foreground uppercase transition-colors hover:bg-secondary/90"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call
              </a>
              <a
                href={`https://wa.me/${invitation.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-primary/50 px-5 py-2.5 text-xs tracking-[0.22em] text-secondary uppercase transition-colors hover:bg-muted"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
