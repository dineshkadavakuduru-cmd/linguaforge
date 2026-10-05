"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Clock3, Languages, Sparkles, Target, Waypoints } from "lucide-react";
import { motion } from "motion/react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { fadeUp } from "@/lib/motion";

// Illustrative examples, not real customer quotes. Clearly labelled in the UI
// so they can never be mistaken for verified testimonials.
const testimonials = [
  { quote: "The first language app that gives me a reason to come back beyond a number going up.", name: "Maya R.", detail: "Spanish learner" },
  { quote: "It feels more like a thoughtful studio for practice than a game asking for attention.", name: "Jonas K.", detail: "Independent learner" },
  { quote: "I finally understand what I am revisiting and why. That changed the habit.", name: "Priya S.", detail: "Spanish learner" },
];

export default function LandingClient() {
  return (
    <main className="overflow-hidden bg-base">
      <section className="relative isolate min-h-[100dvh] border-b border-white/[0.08]">
        <BackgroundBeams />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-12">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-primary"><Languages className="h-4 w-4" /></span>LinguaForge</Link>
          <div className="flex items-center gap-3"><Link href="/auth" className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:block">Sign in</Link><Link href="/auth"><ShimmerButton className="min-h-9 px-4 text-xs">Start learning <ArrowRight className="ml-2 h-3.5 w-3.5" /></ShimmerButton></Link></div>
        </nav>
        <div className="relative mx-auto grid min-h-[calc(100dvh-88px)] max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.03fr_0.97fr] lg:px-12 lg:pb-24 lg:pt-16">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-accent-primary">A calmer way to learn</p>
            <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl"><TextGenerateEffect words="Learn languages. Actually remember them." /></h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg">Deliberate exercises, intelligent review, and a practice loop designed for memory instead of noise.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4"><Link href="/auth"><ShimmerButton>Start learning free <ArrowRight className="ml-2 h-4 w-4" /></ShimmerButton></Link><Link href="#method" className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white">See the method <span aria-hidden="true">↓</span></Link></div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-8 rounded-full bg-accent-primary/10 blur-3xl" />
            <div className="relative rounded-2xl border border-white/10 bg-elevated/80 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs text-zinc-500">Today’s practice</p><p className="mt-1 font-display text-xl text-white">Ser vs. estar</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">A1</span></div>
              <div className="py-10"><p className="text-xs uppercase tracking-[0.16em] text-accent-primary">Choose the sentence</p><p className="mt-4 font-display text-2xl leading-tight text-white">“I am at home.”</p><div className="mt-7 grid gap-2"><div className="rounded-lg border border-accent-primary/50 bg-accent-primary/10 px-4 py-3 text-sm text-white">Estoy en casa.</div><div className="rounded-lg border border-white/10 px-4 py-3 text-sm text-zinc-500">Soy en casa.</div></div></div>
              <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-zinc-500"><span>Review 04 / 10</span><span className="flex items-center gap-1.5 text-zinc-300"><Clock3 className="h-3.5 w-3.5" /> 4 min</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="method" className="mx-auto max-w-6xl px-6 py-24 lg:px-12 lg:py-32"><motion.div {...fadeUp} viewport={{ once: true }} className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">The method</p><h2 className="mt-4 font-display text-4xl tracking-[-0.04em] text-white sm:text-5xl">Less noise. More retrieval.</h2><p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">Every part of the loop earns its place: understand the idea, practice the edge, revisit it before it fades.</p></motion.div><BentoGrid className="mt-14"><BentoGridItem className="md:col-span-4 md:min-h-[280px] bg-[radial-gradient(circle_at_80%_20%,rgba(108,99,255,0.18),transparent_42%),var(--bg-surface)]"><div className="flex h-full flex-col justify-between"><BrainCircuit className="h-7 w-7 text-accent-primary" /><div><h3 className="font-display text-2xl text-white">Practice with intent</h3><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">Exercises are framed around a skill, not an endless feed. You always know what you are training.</p></div></div></BentoGridItem><BentoGridItem className="md:col-span-2 md:min-h-[280px] bg-[#14141c]"><div className="flex h-full flex-col justify-between"><Waypoints className="h-7 w-7 text-emerald-300" /><div><h3 className="font-display text-2xl text-white">Review at the edge</h3><p className="mt-3 text-sm leading-6 text-zinc-400">A memory-aware queue brings back the right idea at the right time.</p></div></div></BentoGridItem><BentoGridItem className="md:col-span-2 md:min-h-[240px] bg-[#16151d]"><Target className="h-7 w-7 text-amber-300" /><h3 className="mt-16 font-display text-2xl text-white">Progress you can feel</h3><p className="mt-3 text-sm leading-6 text-zinc-400">Quiet signals show what is settling in, without turning learning into a scoreboard.</p></BentoGridItem><BentoGridItem className="md:col-span-4 md:min-h-[240px] bg-[linear-gradient(110deg,#111118_0%,#181827_100%)]"><div className="flex h-full items-end justify-between gap-8"><div><Sparkles className="h-7 w-7 text-accent-primary" /><h3 className="mt-10 font-display text-2xl text-white">A workspace for language</h3><p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Save your attention for the sentence in front of you. LinguaForge keeps the interface calm and the feedback specific.</p></div><span className="hidden font-mono text-7xl text-white/[0.05] sm:block">01</span></div></BentoGridItem></BentoGrid></section>

      <section aria-label="What practice with LinguaForge feels like" className="border-y border-white/[0.08] bg-[#0d0d13] px-6 py-24 lg:px-12 lg:py-32"><div className="mx-auto max-w-6xl"><p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Illustrative quotes — examples of the experience we design for, not customer reviews</p><motion.div {...fadeUp} viewport={{ once: true }}><AnimatedTestimonials testimonials={testimonials} /></motion.div></div></section>
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-12 lg:py-32"><motion.div {...fadeUp} viewport={{ once: true }} className="relative overflow-hidden rounded-2xl border border-white/10 bg-elevated px-6 py-16 text-center sm:px-12"><div className="absolute inset-x-1/4 top-0 h-32 rounded-full bg-accent-primary/15 blur-3xl" /><div className="relative"><h2 className="font-display text-4xl tracking-[-0.04em] text-white sm:text-5xl">Make room for what sticks.</h2><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-zinc-400">Start with one focused session. Build the habit from there.</p><Link href="/auth" className="mt-8 inline-block"><ShimmerButton>Start learning free <ArrowRight className="ml-2 h-4 w-4" /></ShimmerButton></Link></div></motion.div></section>
      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-white/[0.08] px-6 py-8 text-xs text-zinc-500 lg:px-12"><span>© 2026 LinguaForge</span><span>Built for deliberate practice.</span></footer>
    </main>
  );
}
