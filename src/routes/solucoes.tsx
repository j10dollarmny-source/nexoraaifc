import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { FEATURES } from "@/lib/features";

export const Route = createFileRoute("/solucoes")({
  head: () => ({
    meta: [
      { title: "Soluções — Nexora AI" },
      { name: "description", content: "Chatbot 24h, automação de mensagens, assistente de vendas e geração de textos com IA." },
      { property: "og:title", content: "Soluções — Nexora AI" },
      { property: "og:description", content: "Ferramentas de IA para atendimento, vendas e tarefas empresariais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Solucoes,
});

const areas = [
  { title: "Atendimento", points: ["Respostas instantâneas 24/7", "Tom de voz da sua marca", "Transferência para humano quando necessário"] },
  { title: "Vendas", points: ["Qualificação automática de leads", "Sugestões de oferta", "Follow-up sem esquecer ninguém"] },
  { title: "Operação", points: ["Textos comerciais prontos", "Mensagens automatizadas", "Indicadores em tempo real"] },
];

function Solucoes() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl font-semibold sm:text-5xl">Soluções de IA para cada área</h1>
          <p className="mt-4 text-lg text-muted-foreground">Ferramentas pensadas para equipes que querem fazer mais com menos esforço.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {areas.map((a) => (
            <div key={a.title} className="feature-card rounded-lg border border-border p-7 shadow-card">
              <h2 className="text-xl font-semibold">{a.title}</h2>
              <ul className="mt-5 space-y-3">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-3 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-20 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4">
              <f.icon className="mt-1 size-5 shrink-0 text-primary" />
              <div><h3 className="font-semibold">{f.title}</h3><p className="mt-1 text-sm text-muted-foreground">{f.text}</p></div>
            </div>
          ))}
        </div>
        <div className="mt-20 text-center">
          <Button asChild variant="hero" size="lg"><Link to="/precos">Ver planos <ArrowRight /></Link></Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
