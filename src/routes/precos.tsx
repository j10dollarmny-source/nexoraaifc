import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PLANS, formatPrice } from "@/lib/plans";

export const Route = createFileRoute("/precos")({
  head: () => ({
    meta: [
      { title: "Preços — Nexora AI" },
      { name: "description", content: "Planos Grátis, Pro e Business para levar IA à sua empresa." },
      { property: "og:title", content: "Preços — Nexora AI" },
      { property: "og:description", content: "Comece grátis e evolua para automações avançadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Precos,
});

function Precos() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative">
        <div className="absolute inset-x-0 top-0 h-96 bg-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-xl text-center animate-fade-up">
            <h1 className="text-4xl font-semibold sm:text-5xl">Planos simples e transparentes</h1>
            <p className="mt-4 text-lg text-muted-foreground">Comece grátis. Evolua quando sua empresa crescer.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`relative flex flex-col rounded-2xl border bg-card p-7 shadow-card ${p.highlight ? "border-primary/60 shadow-glow" : "border-border"}`}>
                {p.highlight && <span className="absolute -top-3 left-7 rounded-full bg-gradient-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">Mais popular</span>}
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-6"><span className="font-display text-4xl font-semibold">{formatPrice(p.price)}</span><span className="text-muted-foreground">/mês</span></p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{f}</li>
                  ))}
                </ul>
                <Button asChild variant={p.highlight ? "hero" : "outline"} className="mt-8 w-full">
                  <Link to="/auth" search={{ mode: "signup" }}>{p.price === 0 ? "Começar grátis" : `Assinar ${p.name}`}</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">Pagamentos dos planos pagos serão habilitados em breve. Todos começam no plano Grátis.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
