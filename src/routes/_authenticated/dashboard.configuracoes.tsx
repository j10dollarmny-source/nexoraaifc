import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { getAiStatus } from "@/lib/ai/status.functions";

export const Route = createFileRoute("/_authenticated/dashboard/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações do chatbot — Nexora AI" },
    { name: "description", content: "Configure o nome, tom de voz e informações do seu assistente Nexora AI." },
    { property: "og:title", content: "Configurações do chatbot — Nexora AI" },
    { property: "og:description", content: "Personalize o atendimento do seu assistente empresarial." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Settings,
});

const tones = ["profissional", "amigável", "descontraído", "formal"];

function Settings() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: ai } = useQuery({ queryKey: ["ai-status"], queryFn: () => getAiStatus() });
  const { data, isLoading } = useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chatbot_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ bot_name: "Assistente Nexora", tone: "profissional", welcome_message: "Olá! Como posso ajudar você hoje?", instructions: "", always_on: true });
  useEffect(() => { if (data) setForm({ bot_name: data.bot_name, tone: data.tone, welcome_message: data.welcome_message, instructions: data.instructions, always_on: data.always_on }); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chatbot_settings").upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Configurações salvas."); qc.invalidateQueries({ queryKey: ["chatbot-settings"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar."),
  });

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="text-2xl font-semibold sm:text-3xl">Configurações do chatbot</h1>
      <p className="mt-1 text-muted-foreground">Defina como seu assistente se apresenta e responde.</p>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div><p className="text-sm font-medium">Integração de IA</p><p className="text-xs text-muted-foreground">Provedor de IA que gera as respostas do assistente.</p></div>
        <span className={`rounded-full px-2.5 py-1 text-xs ${ai?.connected ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{ai?.connected ? "Conectada" : "Não conectada"}</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="grid gap-1.5"><Label htmlFor="bot_name">Nome do assistente</Label>
          <Input id="bot_name" value={form.bot_name} onChange={(e) => setForm({ ...form, bot_name: e.target.value })} required maxLength={60} disabled={isLoading} /></div>
        <div className="grid gap-1.5"><Label>Tom de voz</Label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, tone: t })} className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${form.tone === t ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{t}</button>
            ))}
          </div></div>
        <div className="grid gap-1.5"><Label htmlFor="welcome">Mensagem de boas-vindas</Label>
          <Input id="welcome" value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} maxLength={200} /></div>
        <div className="grid gap-1.5"><Label htmlFor="instructions">Instruções e informações da empresa</Label>
          <Textarea id="instructions" rows={5} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} maxLength={4000} placeholder="Ex.: horário de funcionamento, políticas de troca, produtos principais…" /></div>
        <div className="flex items-center justify-between"><div><Label htmlFor="always_on">Atendimento 24 horas</Label><p className="text-xs text-muted-foreground">Responder fora do horário comercial.</p></div>
          <Switch id="always_on" checked={form.always_on} onCheckedChange={(v) => setForm({ ...form, always_on: v })} /></div>
        <Button type="submit" variant="hero" disabled={save.isPending} className="justify-self-start">{save.isPending ? "Salvando…" : "Salvar configurações"}</Button>
      </form>
    </div>
  );
}
