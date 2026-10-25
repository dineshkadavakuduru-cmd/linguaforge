"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

const AUTO_ROTATE_INTERVAL = 6000;

export function AnimatedTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const current = testimonials[active];

  const goTo = useCallback((index: number) => {
    setActive((prev) => (index + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (!isPaused && testimonials.length > 1) {
      intervalRef.current = setInterval(goNext, AUTO_ROTATE_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, testimonials.length, goNext]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          goPrev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(testimonials.length - 1);
          break;
      }
    },
    [goNext, goPrev, goTo, testimonials.length]
  );

  const announceChange = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${current.name}: ${current.quote}`;
    }
  }, [current.name, current.quote]);

  useEffect(() => {
    announceChange();
  }, [announceChange]);

  return (
    <div
      ref={containerRef}
      className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end"
      role="region"
      aria-label="Illustrative experience examples"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">“{current.quote}”</p>
          <footer className="mt-6 text-sm text-zinc-500">
            <span className="text-zinc-200">{current.name}</span> · {current.detail}
          </footer>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-400">Illustrative example — not a real customer quote</p>
        </motion.blockquote>
      </AnimatePresence>

      <div
        className="flex gap-2 md:pb-1"
        role="tablist"
        aria-label="Select illustrative example"
      >
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.name}
            type="button"
            role="tab"
            id={`testimonial-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`testimonial-panel-${index}`}
            aria-label={`Example from ${testimonial.name}, ${testimonial.detail}`}
            onClick={() => goTo(index)}
            onFocus={() => setActive(index)}
            className={`
              h-2 rounded-full transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base
              ${active === index ? "w-8 bg-accent-primary" : "w-2 bg-white/20 hover:bg-white/40"}
            `}
          />
        ))}
      </div>

      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}