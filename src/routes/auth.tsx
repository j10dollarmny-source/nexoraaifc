import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } =>
    s["mode"] === "signup" || s["mode"] === "forgot" ? { mode: s["mode"] } : {},
  head: () => ({
    meta: [
      { title: "Entrar — Nexora AI" },
      { name: "description", content: "Acesse ou crie sua conta Nexora AI." },
      { property: "og:title", content: "Entrar — Nexora AI" },
      { property: "og:description", content: "Acesse ou crie sua conta Nexora AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const GoogleG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="!size-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initial ?? "login");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: f.get("name"), company: f.get("company") } },
        });
        if (error) throw error;
        toast.success("Conta criada! Confirme seu e-mail para entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para seu e-mail.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Não foi possível entrar. Tente novamente.");
  }

  const title = mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Crie sua conta grátis" : "Redefinir senha";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="absolute inset-0 bg-glow" aria-hidden="true" />
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {mode !== "forgot" && (
            <div className="mt-6 grid gap-2.5">
              <Button type="button" variant="outline" className="h-10" onClick={() => oauth("google")}><GoogleG /> Continuar com Google</Button>
              <Button type="button" variant="outline" className="h-10" onClick={() => oauth("lovable")}><LovableMark className="!size-[18px]" /> Continuar com Lovable</Button>
              <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
            </div>
          )}
          <form onSubmit={onSubmit} className={`grid gap-4 ${mode === "forgot" ? "mt-6" : ""}`}>
            {mode === "signup" && (
              <>
                <div className="grid gap-1.5"><Label htmlFor="name">Nome</Label><Input id="name" name="name" required /></div>
                <div className="grid gap-1.5"><Label htmlFor="company">Empresa</Label><Input id="company" name="company" /></div>
              </>
            )}
            <div className="grid gap-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
            {mode !== "forgot" && (
              <div className="grid gap-1.5">
                <div className="flex justify-between"><Label htmlFor="password">Senha</Label>
                  {mode === "login" && <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Esqueceu?</button>}
                </div>
                <Input id="password" name="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </div>
            )}
            <Button type="submit" variant="hero" className="h-10" disabled={busy}>
              {busy ? "Aguarde…" : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Não tem conta? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Cadastre-se</button></>
            ) : (
              <>Já tem conta? <button onClick={() => setMode("login")} className="text-primary hover:underline">Entrar</button></>
            )}
          </p>
        </div>
        <p className="mt-6 text-center text-sm"><Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao site</Link></p>
      </div>
    </div>
  );
}
