import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessagesSquare, PlugZap, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [
    { title: "Visão geral — KAVROM" },
    { name: "description", content: "Acompanhe conversas, clientes e resultados do atendimento na KAVROM." },
    { property: "og:title", content: "Visão geral — KAVROM" },
    { property: "og:description", content: "Indicadores e histórico de atendimento da sua empresa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Overview,
});

function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, customer_name, channel, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
}

function Overview() {
  const { data = [], isLoading } = useConversations();
  const total = data.length;
  const customers = new Set(data.map((c) => c.customer_name)).size;
  const resolved = data.filter((c) => c.status === "resolvida").length;
  const rate = total ? Math.round((resolved / total) * 100) : 0;

  const stats = [
    { label: "Conversas realizadas", value: total, icon: MessagesSquare },
    { label: "Clientes atendidos", value: customers, icon: Users },
    { label: "Taxa de resolução", value: `${rate}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <h1 className="text-2xl font-semibold sm:text-3xl">Visão geral</h1>
      <p className="mt-1 text-muted-foreground">Acompanhe o desempenho do seu atendimento.</p>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <PlugZap className="mt-0.5 size-5 shrink-0 text-primary" />
        <p><span className="font-medium">Integração de IA ainda não conectada.</span> <span className="text-muted-foreground">As estatísticas abaixo refletem apenas conversas reais registradas. Elas começarão a aparecer quando o chatbot estiver ativo.</span>{" "}
          <Link to="/dashboard/configuracoes" className="text-primary hover:underline">Ver configurações</Link></p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-sm text-muted-foreground">{s.label}<s.icon className="size-4 text-primary" /></div>
            <p className="mt-3 font-display text-3xl font-semibold">{isLoading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Histórico de conversas</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
          ) : data.length === 0 ? (
            <div className="p-10 text-center">
              <MessagesSquare className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">Nenhuma conversa ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">O histórico aparecerá aqui assim que seus clientes conversarem com o assistente.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.slice(0, 50).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                  <div><p className="font-medium">{c.customer_name}</p><p className="text-xs text-muted-foreground">{c.channel} · {new Date(c.created_at).toLocaleString("pt-BR")}</p></div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${c.status === "resolvida" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
