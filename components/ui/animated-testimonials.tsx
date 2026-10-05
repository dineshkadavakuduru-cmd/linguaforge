"use client";

import { useState } from "react";
import { motion } from "motion/react";

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export function AnimatedTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const current = testimonials[active];
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
      <motion.blockquote key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl">
        <p className="font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">“{current.quote}”</p>
        <footer className="mt-6 text-sm text-zinc-500"><span className="text-zinc-200">{current.name}</span> · {current.detail}</footer>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-zinc-600">Illustrative example — not a real customer quote</p>
      </motion.blockquote>
      <div className="flex gap-2 md:pb-1">
        {testimonials.map((testimonial, index) => <button key={testimonial.name} type="button" aria-label={`Show testimonial from ${testimonial.name}`} aria-pressed={active === index} onClick={() => setActive(index)} className={`h-2 rounded-full transition-all ${active === index ? "w-8 bg-accent-primary" : "w-2 bg-white/20 hover:bg-white/40"}`} />)}
      </div>
    </div>
  );
}
