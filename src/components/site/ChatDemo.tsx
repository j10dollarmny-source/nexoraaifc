import { Bot, Send } from "lucide-react";

const msgs = [
  { from: "user", text: "Oi! Vocês entregam em Curitiba?" },
  { from: "bot", text: "Olá! Sim, entregamos em Curitiba em até 2 dias úteis. Quer que eu calcule o frete para seu CEP?" },
  { from: "user", text: "Quero sim, 80010-000." },
] as const;

/** Ilustração estática da interface do chatbot — não é uma conversa real. */
export function ChatDemo() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-lg border border-border bg-background shadow-card">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary"><Bot className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Assistente Nexora</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" /> Online 24h</p>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Demonstração</span>
        </div>
        <div className="space-y-3 px-4 py-5">
          {msgs.map((m, i) => (
            <div key={i} className={`flex animate-fade-up ${m.from === "user" ? "justify-end" : ""}`} style={{ animationDelay: `${300 + i * 500}ms` }}>
              <p className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.text}
              </p>
            </div>
          ))}
          <div className="flex animate-fade-up gap-1 px-1" style={{ animationDelay: "1900ms" }} aria-label="Digitando">
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: `${d * 0.2}s` }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <div className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">Digite sua mensagem…</div>
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground"><Send className="size-4" /></span>
        </div>
      </div>
    </div>
  );
}
