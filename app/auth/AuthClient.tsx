"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Globe2, Languages, Apple } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "@/components/providers/AuthProvider";
import { wrongShake } from "@/lib/motion";

type Mode = "signin" | "signup";

export default function AuthClient() {
  const router = useRouter();
  const { user, loading, signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (user) router.replace("/dashboard"); }, [router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { if (mode === "signup") await signUp(email, password, displayName); else await signIn(email, password); router.replace("/dashboard"); }
    catch (authError) { const message = authError instanceof Error ? authError.message : "Authentication failed. Try again."; setError(message.replace("Firebase: ", "").replace(/ \(auth\/[^)]+\)\.?$/, ".")); }
    finally { setBusy(false); }
  }

  async function handleGoogle() {
    setBusy(true); setError("");
    try { await signInWithGoogle(); router.replace("/dashboard"); }
    catch (authError) { setError(authError instanceof Error ? authError.message : "Google sign-in failed."); }
    finally { setBusy(false); }
  }

  async function handleApple() {
    setBusy(true); setError("");
    try { await signInWithApple(); router.replace("/dashboard"); }
    catch (authError) { setError(authError instanceof Error ? authError.message : "Apple sign-in failed."); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="grid min-h-dvh place-items-center bg-base text-sm text-zinc-500">Loading your workspace...</div>;
  return (
    <AuroraBackground>
      <main className="mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-[1fr_420px] lg:px-12">
        <div className="hidden max-w-lg lg:block"><div className="mb-8 inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-primary text-white"><Languages className="h-4 w-4" /></span>LinguaForge</div><h1 className="font-display text-5xl leading-[1.04] tracking-[-0.04em] text-white xl:text-6xl">Build a language habit that lasts.</h1><p className="mt-6 max-w-md text-base leading-7 text-zinc-400">A focused place to learn deliberately, revisit what matters, and make steady progress.</p><div className="mt-12 grid grid-cols-2 gap-3 text-sm text-zinc-400"><div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">Calm, focused sessions</div><div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">Practice that adapts</div></div></div>
        <section className="rounded-xl border border-default bg-elevated/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"><div className="mb-8 lg:hidden"><div className="inline-flex items-center gap-2 text-sm font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-primary"><Languages className="h-4 w-4" /></span>LinguaForge</div></div><div className="mb-7"><h2 className="font-display text-3xl tracking-tight text-white">{mode === "signin" ? "Welcome back" : "Create your account"}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{mode === "signin" ? "Pick up where your practice left off." : "Start with Spanish and build from there."}</p></div><div className="mb-6 grid grid-cols-2 border-b border-white/10">{(["signin", "signup"] as const).map((tab) => <button key={tab} type="button" onClick={() => { setMode(tab); setError(""); }} className={`border-b-2 pb-3 text-sm font-medium transition-colors ${mode === tab ? "border-accent-primary text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>{tab === "signin" ? "Sign in" : "Sign up"}</button>)}</div><button type="button" onClick={handleGoogle} disabled={busy} className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50"><Globe2 className="h-4 w-4" /> Continue with Google</button><button type="button" onClick={handleApple} disabled={busy} className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/[0.04] text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50"><Apple className="h-4 w-4" /> Continue with Apple</button><div className="my-6 flex items-center gap-3 text-xs text-zinc-600"><span className="h-px flex-1 bg-white/10" />or continue with email<span className="h-px flex-1 bg-white/10" /></div><form onSubmit={handleSubmit} className="space-y-4">{mode === "signup" && <label className="block text-sm text-zinc-300"><span className="mb-2 block">Name</span><input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-accent-primary" placeholder="Your name" /></label>}<label className="block text-sm text-zinc-300"><span className="mb-2 block">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-accent-primary" placeholder="you@example.com" /></label><label className="block text-sm text-zinc-300"><span className="mb-2 block">Password</span><span className="relative block"><input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-white/10 bg-black/20 px-3 pr-10 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-accent-primary" placeholder="At least 6 characters" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>{error && <motion.div key={error} role="alert" {...wrongShake} className="flex items-start gap-2 rounded-md border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-5 text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div>}<ShimmerButton type="submit" disabled={busy} className="w-full">{busy ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight className="ml-2 h-4 w-4" /></ShimmerButton></form><p className="mt-6 text-center text-xs leading-5 text-zinc-600">By continuing, you agree to use LinguaForge for deliberate practice.</p></section>
      </main>
    </AuroraBackground>
  );
}