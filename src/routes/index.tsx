import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/features";
import { Button } from "@/components/ui/button";
import { ChatDemo } from "@/components/site/ChatDemo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import chromeNexus from "@/assets/chrome-nexus.jpg";

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
        <section className="site-hero relative overflow-hidden border-b border-border">
          <img src={chromeNexus} alt="" aria-hidden="true" width={1536} height={1024} fetchPriority="high" className="site-hero-image" />
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-20 md:pt-20">
            <div className="max-w-2xl animate-fade-up">
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" /> Plataforma de IA para empresas
              </span>
              <p className="mt-7 font-display text-lg font-semibold text-muted-foreground">Nexora AI</p>
              <h1 className="mt-3 max-w-xl text-[42px] font-semibold leading-[1.08] sm:text-6xl lg:text-7xl">
                Sua empresa mais <span className="text-muted-foreground">inteligente</span> começa aqui.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                Automatize processos, atenda clientes e aumente resultados com inteligência artificial.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight /></Link>
                </Button>
                <Button asChild variant="outline" size="lg"><Link to="/solucoes">Ver soluções</Link></Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Sem cartão de crédito.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="section-heading">
            <h2>Tudo o que sua operação precisa</h2>
            <p className="mt-3 text-muted-foreground">Seis ferramentas integradas em um só lugar.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card group min-h-52 rounded-lg border border-border p-7 shadow-card transition-[transform,border-color] duration-300 hover:border-primary/30">
                <span className="grid size-11 place-items-center rounded-lg border border-border bg-background/50 text-primary transition-transform group-hover:scale-110"><f.icon className="size-5" /></span>
                <h3 className="mt-7 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-t-3xl border-t border-border bg-card">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
            <div className="section-heading">
              <h2 className="text-3xl font-semibold sm:text-4xl">Comece hoje, sem custo.</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">Crie sua conta e configure seu primeiro assistente em minutos.</p>
              <Button asChild variant="hero" size="lg" className="mt-8">
                <Link to="/auth" search={{ mode: "signup" }}>Começar gratuitamente <ArrowRight /></Link>
              </Button>
            </div>
            <ChatDemo />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
