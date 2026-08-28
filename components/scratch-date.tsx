'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Countdown } from '@/components/countdown'
import { useInvitation } from '@/lib/invitation-context'

const REVEAL_THRESHOLD = 0.45
const BRUSH_RADIUS = 20
const PROGRESS_INTERVAL = 160

type RevealSide = 'left' | 'right'

export function ScratchDate() {
  const { invitation } = useInvitation()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const lastProgressCheck = useRef(0)

  const [revealed, setRevealed] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [scratchStarted, setScratchStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [revealSide, setRevealSide] = useState<RevealSide>('left')
  const [burstKey, setBurstKey] = useState(0)

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        x: index % 2 === 0 ? 18 + (index % 5) * 10 : 82 - (index % 5) * 10,
        y: 28 + (index % 6) * 9,
        dx: (revealSide === 'left' ? -1 : 1) * (16 + (index % 8) * 12),
        dy: -20 - (index % 7) * 14,
        delay: (index % 6) * 0.04,
        duration: 0.7 + (index % 5) * 0.12,
        size: 5 + (index % 4) * 2,
        hue: index % 2 === 0 ? 42 : 52,
      })),
    [revealSide]
  )

  const reveal = useCallback(() => {
    if (revealed) return

    setRevealed(true)
    setBurstKey((value) => value + 1)
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    window.setTimeout(() => setShowTime(true), 900)
  }, [revealed])

  useEffect(() => {
    if (!scratchStarted || revealed) return

    const timer = window.setTimeout(() => {
      reveal()
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [scratchStarted, reveal, revealed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const paint = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.fillStyle = '#999'
      ctx.fillRect(0, 0, rect.width, rect.height)

      ctx.fillStyle = '#666'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.save()
      ctx.translate(rect.width / 2, rect.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('SCRATCH', 0, -10)
      ctx.fillText('HERE', 0, 10)
      ctx.restore()
    }

    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const scratchPoint = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS)
    gradient.addColorStop(0, 'rgba(0,0,0,1)')
    gradient.addColorStop(0.75, 'rgba(0,0,0,0.9)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [])

  const updateProgress = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    try {
      const data = ctx.getImageData(0, 0, width, height).data
      let transparent = 0
      let samples = 0
      const density = 10

      for (let i = 3; i < data.length; i += 4 * density) {
        samples += 1
        if (data[i] < 32) transparent += 1
      }

      const ratio = samples > 0 ? transparent / samples : 0
      setProgress(Math.min(100, Math.round(ratio * 100)))
      if (ratio >= REVEAL_THRESHOLD) reveal()
    } catch {
      // ignore tainted canvas errors
    }
  }, [reveal])

  const handleDraw = useCallback(
    (x: number, y: number) => {
      if (!drawing.current || revealed) return

      if (lastPoint.current) {
        const dx = x - lastPoint.current.x
        const dy = y - lastPoint.current.y
        const dist = Math.hypot(dx, dy)
        const steps = Math.max(1, Math.ceil(dist / (BRUSH_RADIUS / 2)))
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          scratchPoint(lastPoint.current.x + dx * t, lastPoint.current.y + dy * t)
        }
      } else {
        scratchPoint(x, y)
      }

      lastPoint.current = { x, y }

      const now = performance.now()
      if (now - lastProgressCheck.current > PROGRESS_INTERVAL) {
        lastProgressCheck.current = now
        updateProgress()
      }
    },
    [revealed, scratchPoint, updateProgress]
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      setScratchStarted(true)
      setRevealSide(event.clientX < window.innerWidth / 2 ? 'left' : 'right')
      const canvas = canvasRef.current
      if (!canvas) return
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {}
      drawing.current = true
      lastPoint.current = null
      const coords = getCoordinates(event.clientX, event.clientY)
      if (coords) handleDraw(coords.x, coords.y)
    },
    [handleDraw]
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(event.clientX, event.clientY)
      if (coords) handleDraw(coords.x, coords.y)
    },
    [handleDraw]
  )

  const stopDrawing = useCallback(() => {
    drawing.current = false
    lastPoint.current = null
    updateProgress()
  }, [updateProgress])

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      setScratchStarted(true)
      if (event.touches.length > 0) {
        setRevealSide(event.touches[0].clientX < window.innerWidth / 2 ? 'left' : 'right')
      }
      if (event.touches.length === 0) return
      drawing.current = true
      lastPoint.current = null
      const touch = event.touches[0]
      const coords = getCoordinates(touch.clientX, touch.clientY)
      if (coords) handleDraw(coords.x, coords.y)
    },
    [handleDraw]
  )

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      if (!drawing.current || event.touches.length === 0) return
      const touch = event.touches[0]
      const coords = getCoordinates(touch.clientX, touch.clientY)
      if (coords) handleDraw(coords.x, coords.y)
    },
    [handleDraw]
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-sm">
        <div
          className={`relative overflow-hidden rounded-3xl border border-primary/40 bg-card p-1 shadow-[0_25px_70px_-30px_rgba(0,0,0,0.45)] transition-all duration-700 ${
            revealed ? 'scale-[1.02] shadow-[0_30px_80px_-30px_rgba(212,175,55,0.35)]' : ''
          }`}
        >
          <div className="relative flex h-72 flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-primary/20 bg-gradient-to-b from-muted/75 to-background text-center text-foreground">
            <p className="text-[0.6rem] tracking-[0.45em] text-primary uppercase">Insha'Allah</p>
            <p className="font-sans text-xl tracking-[0.3em] text-foreground uppercase">
              {invitation.date.weekday}
            </p>
            <p className="gold-text font-script text-5xl leading-tight">
              {invitation.date.day} {invitation.date.month}
            </p>
            <p className="font-sans text-lg tracking-[0.35em] text-foreground">
              {invitation.date.year}
            </p>
            <div className="gold-rule my-2 h-px w-24" />
            <p className="gold-text font-script text-3xl leading-none">
              {invitation.time.label}
            </p>
            <p className="text-[0.6rem] tracking-[0.28em] text-foreground/90 uppercase">
              {invitation.time.note}
            </p>
          </div>

          <div
            className={`cracker-burst reveal-side-${revealSide} ${revealed ? 'active' : ''}`}
            key={burstKey}
            aria-hidden="true"
          >
            {particles.map((particle) => {
              const style = {
                '--x': `${particle.x}%`,
                '--y': `${particle.y}%`,
                '--dx': `${particle.dx}px`,
                '--dy': `${particle.dy}px`,
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.duration}s`,
                '--size': `${particle.size}px`,
                '--hue': `${particle.hue}`,
              } as CSSProperties

              return <span key={particle.id} className="spark" style={style} />
            })}
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className={`absolute inset-1 touch-none rounded-[1.25rem] transition-all duration-700 ${
              revealed ? 'pointer-events-none scale-105 opacity-0' : 'cursor-grab active:cursor-grabbing opacity-100'
            }`}
            style={{ touchAction: 'none' }}
            aria-label="Scratch the golden foil to reveal the Walima date"
          />

          {!revealed && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-2 pb-5">
              <span className="rounded-full bg-secondary/90 px-4 py-1.5 text-[0.65rem] tracking-[0.28em] text-secondary-foreground uppercase shadow-lg backdrop-blur-sm">
                Scratch to reveal date & time
              </span>
            </div>
          )}
        </div>

        {!revealed && (
          <button
            type="button"
            onClick={reveal}
            className={`mx-auto mt-4 block rounded-full border border-transparent bg-transparent px-3 py-2 text-xs tracking-[0.28em] uppercase underline decoration-primary/50 underline-offset-4 transition-colors hover:text-foreground ${
              scratchStarted ? 'button-highlight text-primary' : 'text-foreground'
            }`}
          >
            Reveal instead
          </button>
        )}
      </div>

      <div
        className={`flex w-full justify-center transition-all duration-1000 ${
          showTime ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
        aria-hidden={!showTime}
      >
        {showTime && <Countdown />}
      </div>
    </div>
  )
}
