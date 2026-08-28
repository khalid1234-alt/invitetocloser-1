'use client'

import { Reveal } from '@/components/reveal'
import { useInvitation } from '@/lib/invitation-context'

export function ClosingSection() {
  const { invitation } = useInvitation()
  return (
    <footer className="relative overflow-hidden px-6 pt-12 pb-16">
      <img
        src="/images/gold-arch.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[60%] w-auto max-w-none rotate-180 opacity-15 mix-blend-multiply"
        style={{
          maskImage:
            'radial-gradient(ellipse at 50% 40%, black 40%, transparent 74%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 40%, black 40%, transparent 74%)',
        }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <Reveal>
          <h3 className="gold-text font-script text-4xl leading-tight text-balance">
            Your presence will make our day beautiful
          </h3>
        </Reveal>

        <Reveal delay={120} className="w-full">
          <div className="flex flex-col items-center gap-3">
            <span className="gold-rule h-px w-24" />
            <p className="text-pretty text-base leading-relaxed gold-text italic">
              &ldquo;The best of you are those who are best to their
              families.&rdquo;
            </p>
            <p className="text-xs tracking-[0.3em] text-primary uppercase">
              Tirmidhi
            </p>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <p className="max-w-sm text-pretty text-base leading-relaxed text-foreground/80">
            We look forward to celebrating this blessed day with you and seeking
            your duas.
          </p>
        </Reveal>

        <Reveal delay={300} className="w-full">
          <div className="flex flex-col items-center gap-2 pt-4">
            <p className="gold-text font-script text-3xl">
              Jazak&apos;Allah Khair
            </p>
            <div className="rounded-2xl bg-card/80 px-4 py-2 scratch-shimmer">
              <p className="text-xs tracking-[0.34em] text-muted-foreground uppercase text-center">
                {invitation.groom} &amp; {invitation.bride} ✦ {invitation.date.full}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}
