'use client'

import { useEffect, useState } from 'react'
import { useInvitation } from '@/lib/invitation-context'

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function Countdown() {
  const { invitation } = useInvitation()
  /* start at null so the server and the first client paint agree */
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setLeft(new Date(invitation.startsAt).getTime() - Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [invitation.startsAt])

  const t = split(left ?? 0)
  const arrived = left !== null && left <= 0

  const units = [
    { label: 'Days', value: t.days },
    { label: 'Hours', value: pad(t.hours) },
    { label: 'Minutes', value: pad(t.minutes) },
    { label: 'Seconds', value: pad(t.seconds) },
  ]

  return (
    <div className="w-full max-w-sm rounded-2xl border border-primary/40 border-dashed bg-card/80 px-4 py-6 text-center backdrop-blur-sm">
      <p className="text-[0.6rem] tracking-[0.4em] text-primary uppercase">
        {arrived ? 'The Blessed Day Is Here' : 'Counting Down To The Walima'}
      </p>

      <div
        className="mt-4 flex items-start justify-center gap-2"
        role="timer"
        aria-live="off"
        aria-label="Time remaining until the Walima"
      >
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-start gap-2">
            {i > 0 && (
              <span className="gold-text pt-1 font-sans text-2xl leading-none">
                :
              </span>
            )}
            <div className="flex min-w-16 flex-col items-center gap-1">
              <span className="gold-text font-sans text-3xl leading-none tabular-nums">
                {left === null ? '--' : unit.value}
              </span>
              <span className="text-[0.55rem] tracking-[0.24em] text-muted-foreground uppercase">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="gold-rule mx-auto mt-5 h-px w-24" />
      <p className="mt-3 text-xs tracking-[0.2em] text-secondary/80 uppercase">
        {invitation.date.full} · {invitation.time.label}
      </p>
    </div>
  )
}
