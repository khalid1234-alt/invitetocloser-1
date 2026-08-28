'use client'

import { Ornament } from '@/components/ornament'
import { Reveal } from '@/components/reveal'
import { useInvitation } from '@/lib/invitation-context'
import Slider3D from '@/components/slider-3d'

export function HeroInvite() {
  const { invitation } = useInvitation()
  return (
    <section className="relative overflow-hidden px-6 pt-14 pb-16 sm:pt-20">
      <img
        src="/images/gold-arch.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[70%] w-auto max-w-none opacity-20 mix-blend-multiply"
        style={{
          maskImage:
            'radial-gradient(ellipse at 50% 38%, black 12%, transparent 76%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 38%, black 12%, transparent 76%)',
        }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <Reveal>
          <p className="text-[0.65rem] tracking-[0.42em] text-primary uppercase">
            ✦ You are Invited ✦
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-base tracking-[0.12em] text-muted-foreground uppercase">
            To the {invitation.occasion} of
          </p>
        </Reveal>

        <Reveal delay={220} className="w-full">
          <div className="flex flex-col items-center gap-2">
            <h1 className="gold-text px-3 sm:px-4 font-script text-6xl leading-[1.1] sm:text-7xl">
              {invitation.groom}
            </h1>
            <span className="font-sans text-sm tracking-[0.4em] text-secondary/70 uppercase">
              &amp;
            </span>
            <h1 className="gold-text px-3 sm:px-4 font-script text-6xl leading-[1.1] sm:text-7xl">
              {invitation.bride}
            </h1>
          </div>
        </Reveal>

        <Reveal delay={340} className="w-full">
          <Ornament />
        </Reveal>

        <Reveal delay={420} className="w-full">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/35 bg-card/70 px-6 py-7">
            <p className="font-arabic text-2xl leading-relaxed text-secondary">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              In the name of Allah, the Most Beneficent, the Most Merciful
            </p>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <p className="max-w-sm text-pretty text-base leading-relaxed gold-text">
            With the blessings of Almighty Allah, {invitation.hosts} request the
            honour of your presence at the Walima reception, an evening of
            prayers, feast and gratitude.
          </p>
        </Reveal>

        <Reveal delay={640} className="w-full">
          <div className="w-full pt-6">
            <Slider3D />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
