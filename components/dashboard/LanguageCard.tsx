import Link from "next/link";
import { ArrowUpRight, Languages } from "lucide-react";
import { CardBody, CardContainer } from "@/components/ui/3d-card-effect";

export function LanguageCard({ lang = "es", name = "Spanish", nativeName = "Español", skillId = "present-tense-regular-verbs" }: { lang?: string; name?: string; nativeName?: string; skillId?: string }) {
  return (
    <CardContainer>
      <CardBody>
        <section className="relative h-full overflow-hidden rounded-xl border border-default bg-surface p-6">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-accent-primary/15 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active language</p>
              <p className="mt-3 font-display text-3xl tracking-tight text-white">{name}</p>
              <p className="mt-1 text-sm text-zinc-500">{nativeName} · A1 foundations</p>
            </div>
            <div className="rounded-lg border border-accent-primary/25 bg-accent-primary/10 p-3 text-accent-primary">
              <Languages className="h-5 w-5" />
            </div>
          </div>
          <Link href={`/learn/${lang}/${skillId}`} className="relative mt-7 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-accent-primary">
            Begin learning <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>
      </CardBody>
    </CardContainer>
  );
}
