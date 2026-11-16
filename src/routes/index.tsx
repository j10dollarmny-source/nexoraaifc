import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { ChatDemo } from "@/components/site/ChatDemo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora AI — Inteligência artificial para empresas" },
      { name: "description", content: "Automatize processos, atenda clientes e aumente resultados com inteligência artificial." },
      { property: "og:title", content: "Nexora AI — Inteligência artificial para empresas" },
      { property: "og:description", content: "Chatbots, automação de mensagens e assistente de vendas com IA para sua empresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid" aria-hidden="true" />
          <div className="absolute inset-0 bg-glow" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 md:grid-cols-2 md:pt-24">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" /> Plataforma de IA para empresas
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                Sua empresa mais <span className="text-gradient">inteligente</span> começa aqui.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Automatize processos, atenda clientes e aumente resultados com inteligência artificial.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight /></Link>
                </Button>
                <Button asChild variant="ghost" size="lg"><Link to="/solucoes">Ver soluções</Link></Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Sem cartão de crédito.</p>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
              <ChatDemo />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">Tudo o que sua operação precisa</h2>
            <p className="mt-3 text-muted-foreground">Seis ferramentas integradas em um só lugar.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110"><f.icon className="size-5" /></span>
                <h3 className="mt-5 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-card">
            <div className="absolute inset-0 bg-glow" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl font-semibold sm:text-4xl">Comece hoje, sem custo.</h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">Crie sua conta e configure seu primeiro assistente em minutos.</p>
              <Button asChild variant="hero" size="lg" className="mt-8">
                <Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
