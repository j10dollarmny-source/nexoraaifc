import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Nexora AI" },
      { name: "description", content: "Defina uma nova senha para sua conta Nexora AI." },
      { property: "og:title", content: "Nova senha — Nexora AI" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password"));
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Senha atualizada!");
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-border bg-card p-7 shadow-card">
          <h1 className="text-2xl font-semibold">Defina uma nova senha</h1>
          <div className="grid gap-1.5"><Label htmlFor="password">Nova senha</Label><Input id="password" name="password" type="password" minLength={6} required /></div>
          <Button type="submit" variant="hero" disabled={busy}>{busy ? "Salvando…" : "Salvar senha"}</Button>
        </form>
      </div>
    </div>
  );
}
