"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useInvitation } from '@/lib/invitation-context';
import { LocationPicker, type SelectedLocation } from '@/components/location-picker';

type Stage = "form" | "idle" | "playing" | "closing" | "done";

export function OpenGate({
  autoPlay = false,
  startStage,
}: {
  autoPlay?: boolean
  startStage?: Stage
}) {
  const [stage, setStage] = useState<Stage>(startStage ?? "form");
  const [formError, setFormError] = useState('');
  const [showNames, setShowNames] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { invitation, setInvitation } = useInvitation();
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  useEffect(() => {
    if (startStage) {
      setStage(startStage)
      return
    }

    const params = new URLSearchParams(window.location.search);
    const fields = ['groom', 'bride', 'father', 'address', 'date', 'time', 'lat', 'lon'];
    const hasDetails = fields.every((field) => params.get(field)?.trim());
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '');
    const validTime = /^\d{2}:\d{2}$/.test(params.get('time') || '');
    const validCoordinates = Number.isFinite(Number(params.get('lat'))) && Number.isFinite(Number(params.get('lon')));
    if (hasDetails && validDate && validTime && validCoordinates) setStage('idle');
  }, [startStage]);

  const submitDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const groom = String(form.get('groom') || '').trim();
    const bride = String(form.get('bride') || '').trim();
    const father = String(form.get('father') || '').trim();
    const address = String(form.get('address') || '').trim();
    const dateValue = String(form.get('date') || '');
    const timeValue = String(form.get('time') || '');
    if (!groom || !bride || !father || !address || !dateValue || !timeValue || !selectedLocation) {
      setFormError(selectedLocation ? 'Please complete every detail to continue.' : 'Please search for and choose a location from the map results.');
      return;
    }
    const date = new Date(`${dateValue}T12:00:00`);
    const time = new Date(`1970-01-01T${timeValue}:00`);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const label = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setInvitation({
      ...invitation,
      groom,
      bride,
      hosts: `The Family of Mr. ${father}`,
      date: { weekday, day: dateValue.slice(8, 10), month, year: dateValue.slice(0, 4), full: `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}` },
      time: { label, note: 'Dinner Onwards' },
      startsAt: `${dateValue}T${timeValue}:00`,
      venue: selectedLocation,
    });
    const params = new URLSearchParams({ groom, bride, father, address, date: dateValue, time: timeValue, lat: String(selectedLocation.lat), lon: String(selectedLocation.lon) });
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    setFormError('');
    setStage('idle');
  };

  /* lock scrolling until the film has finished */
  useEffect(() => {
    const locked = stage !== "done";
    document.documentElement.classList.toggle("scroll-locked", locked);
    document.body.classList.toggle("scroll-locked", locked);
    if (locked) window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove("scroll-locked");
      document.body.classList.remove("scroll-locked");
    };
  }, [stage]);

  /* names appear 4s after the video starts */
  useEffect(() => {
    if (stage !== "playing") return;
    const t = window.setTimeout(() => setShowNames(true), 4000);
    return () => window.clearTimeout(t);
  }, [stage]);

  const open = async () => {
    setStage("playing");
    const video = videoRef.current;
    if (!video) return;
    try {
      video.currentTime = 0;
      await video.play();
    } catch {
      video.muted = true;
      void video.play();
    }
  };

  useEffect(() => {
    if (autoPlay && stage === 'idle') {
      void open();
    }
  }, [autoPlay, stage]);

  const finish = () => {
    setStage("closing");
    window.setTimeout(() => setStage("done"), 900);
  };

  if (stage === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-700 ${
        stage === "closing" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={stage === "closing"}
    >
      {/* ---------- invitation details ---------- */}
      <div className={`paper-bg absolute inset-0 flex items-center justify-center overflow-y-auto px-6 py-8 transition-opacity duration-700 ${stage === 'form' ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <form onSubmit={submitDetails} className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-2xl border border-primary/40 bg-card/95 px-6 py-7 shadow-xl">
          <div className="text-center">
            <p className="text-xs tracking-[0.35em] text-primary uppercase">Your Invitation</p>
            <h1 className="mt-2 font-script text-4xl text-secondary">Add the details</h1>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['groom', 'Groom name', 'text'],
              ['bride', 'Bride name', 'text'],
              ['father', "Father's name", 'text'],
              ['date', 'Date', 'date'],
              ['time', 'Time', 'time'],
            ].map(([name, label, type]) => (
              <label key={name} className={name === 'address' ? 'sm:col-span-2' : ''}>
                <span className="mb-1.5 block text-xs tracking-[0.16em] text-muted-foreground uppercase">{label}</span>
                <input name={name} type={type} required className="w-full rounded-lg border border-primary/35 bg-background/70 px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary" />
              </label>
            ))}
            <LocationPicker value={selectedLocation} onChange={setSelectedLocation} />
          </div>
          {formError && <p className="text-center text-sm text-destructive">{formError}</p>}
          <button type="submit" className="rounded-full bg-secondary px-6 py-3 text-sm tracking-[0.22em] text-secondary-foreground uppercase transition-colors hover:bg-secondary/90">Continue</button>
        </form>
      </div>

      {/* ---------- invitation cover ---------- */}
      <div
        className={`paper-bg absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 transition-opacity duration-700 ${
          stage === "idle" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* opaque base + the same blurred mosque backdrop as the page */}
        <div className="absolute inset-0 bg-background" aria-hidden="true" />
        <div className="fixed-bg" aria-hidden="true" />
        <div className="fixed-bg-veil" aria-hidden="true" />

        <img
          src="/images/gold-arch.png"
          alt=""
          className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto h-[62%] w-auto max-w-none opacity-25 mix-blend-multiply"
          style={{
            maskImage:
              "radial-gradient(ellipse at 50% 40%, black 45%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 40%, black 45%, transparent 78%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <p className="text-xs tracking-[0.42em] text-primary uppercase">
            Bismillah
          </p>
          <div className="gold-rule h-px w-24" />
          <h1 className="font-script text-4xl leading-tight text-secondary sm:text-5xl">
            {invitation.occasion}
          </h1>
          <p className="max-w-xs text-pretty text-base leading-relaxed text-muted-foreground">
            A film of blessings awaits you. Kindly open your invitation.
          </p>
        </div>

        <button
          type="button"
          onClick={open}
          className="animate-halo relative z-10 flex size-28 items-center justify-center rounded-full border border-primary/60 bg-secondary text-secondary-foreground transition-transform duration-300 active:scale-95 sm:size-32"
        >
          <span className="absolute inset-1.5 rounded-full border border-primary/40" />
          <span className="font-sans text-lg tracking-[0.32em] uppercase">
            Open
          </span>
        </button>

        <p className="relative text-xs tracking-[0.28em] text-muted-foreground uppercase">
          Tap to begin
        </p>
      </div>

      {/* ---------- full page film ---------- */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-700 ${
          stage === "idle" ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <video
          ref={videoRef}
          src="/media/invitation.mp4"
          playsInline
          preload="auto"
          onEnded={finish}
          className="size-full object-cover"
        />

        {/* names revealed after 4 seconds */}
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center transition-all duration-1000 ${
            showNames ? "opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 px-3 sm:px-4"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.5) 42%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0.1) 100%)",
            }}
          />
          <p className="relative text-[0.65rem] translate-y-4 mt-4 tracking-[0.45em] text-primary uppercase sm:text-xs">
            Walima Ceremony of
          </p>
          <h2 className="gold-text px-3 sm:px-4 relative font-script text-5xl leading-[1.15] sm:text-7xl">
            {invitation.groom}
          </h2>
          <span className="relative font-sans text-base tracking-[0.3em] text-white/80 uppercase">
            &amp;
          </span>
          <h2 className="gold-text px-3 sm:px-4 relative font-script text-5xl leading-[1.15] sm:text-7xl">
            {invitation.bride}
          </h2>
          <div className="shimmer-line relative mt-2 h-px w-40" />
        </div>
      </div>
    </div>
  );
}
