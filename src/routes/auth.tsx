import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { authError, validateAuth, type AuthMode } from "@/lib/auth-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Mode = AuthMode;

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } =>
    s["mode"] === "signup" || s["mode"] === "forgot" ? { mode: s["mode"] } : {},
  head: () => ({
    meta: [
      { title: "Entrar — KAVROM" },
      { name: "description", content: "Acesse ou crie sua conta KAVROM." },
      { property: "og:title", content: "Entrar — KAVROM" },
      { property: "og:description", content: "Acesse ou crie sua conta KAVROM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const GoogleG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="!size-[18px] [&_path]:fill-current"
  >
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

function AuthPage() {
  const { mode: initial } = Route.useSearch();
  const mode = initial ?? "login";
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);
  useEffect(() => {
    setErrors({});
    setFailure("");
    setShowPassword(false);
    setShowConfirmation(false);
  }, [mode]);

  async function changeMode(next: Mode) {
    setSuccess("");
    await navigate({ to: "/auth", search: next === "login" ? {} : { mode: next } });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setFailure("");
    setSuccess("");
    const form = e.currentTarget;
    const f = new FormData(form);
    const input = Object.fromEntries(
      ["name", "email", "password", "confirmation"].map((key) => [key, String(f.get(key) ?? "")]),
    );
    const result = validateAuth(mode, input);
    if (!result.success) {
      const issues: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!issues[field]) issues[field] = issue.message;
      }
      setErrors(issues);
      form.querySelector<HTMLInputElement>(`[name="${Object.keys(issues)[0]}"]`)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    const email = input["email"]?.trim() ?? "";
    const password = input["password"] ?? "";
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/dashboard", replace: true });
      } else if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: input["name"]?.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          await navigate({ to: "/dashboard", replace: true });
        } else {
          form.reset();
          setSuccess(
            "Confira seu e-mail para confirmar o cadastro e acessar sua conta. Se já tiver uma conta, entre abaixo.",
          );
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess(
          "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        );
      }
    } catch (err) {
      setFailure(authError(err));
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    if (busy) return;
    setBusy(true);
    setFailure("");
    setSuccess("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) setFailure("Não foi possível entrar. Tente novamente.");
    } catch (err) {
      setFailure(authError(err));
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login"
      ? "Bem-vindo de volta."
      : mode === "signup"
        ? "Crie sua conta."
        : "Esqueceu sua senha?";
  const fieldClass =
    "h-12 rounded-lg bg-secondary/30 px-4 text-base transition-colors hover:border-muted-foreground/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 aria-invalid:border-destructive";
  const fieldError = (field: string) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-xs text-destructive">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 sm:px-10">
        <Logo />
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link to="/">
            <ArrowLeft /> Voltar ao site
          </Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-10 sm:py-14">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">KAVROM</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {mode === "login"
                ? "Entre na sua conta para continuar."
                : mode === "signup"
                  ? "Seu próximo passo começa aqui."
                  : "Receba um link para recuperar o acesso à sua conta."}
            </p>
          </div>
          <form key={mode} onSubmit={onSubmit} noValidate className="grid gap-5" aria-busy={busy}>
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  className={fieldClass}
                  id="name"
                  name="name"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  maxLength={100}
                  required
                  disabled={busy}
                  aria-invalid={!!errors["name"]}
                  aria-describedby={errors["name"] ? "name-error" : undefined}
                />
                {fieldError("name")}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                className={fieldClass}
                id="email"
                name="email"
                type="email"
                placeholder="voce@empresa.com"
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                maxLength={255}
                disabled={busy}
                aria-invalid={!!errors["email"]}
                aria-describedby={errors["email"] ? "email-error" : undefined}
              />
              {fieldError("email")}
            </div>
            {mode !== "forgot" && (
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    className={`${fieldClass} pr-14`}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "signup" ? "Pelo menos 6 caracteres" : "Sua senha"}
                    required
                    maxLength={128}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    disabled={busy}
                    aria-invalid={!!errors["password"]}
                    aria-describedby={errors["password"] ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showPassword}
                    disabled={busy}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {fieldError("password")}
                {mode === "login" && (
                  <Button
                    type="button"
                    variant="link"
                    disabled={busy}
                    onClick={() => changeMode("forgot")}
                    className="h-auto justify-self-end p-0 text-xs text-muted-foreground"
                  >
                    Esqueci minha senha
                  </Button>
                )}
              </div>
            )}
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="confirmation">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    className={`${fieldClass} pr-14`}
                    id="confirmation"
                    name="confirmation"
                    type={showConfirmation ? "text" : "password"}
                    placeholder="Repita sua senha"
                    required
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={busy}
                    aria-invalid={!!errors["confirmation"]}
                    aria-describedby={errors["confirmation"] ? "confirmation-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 text-muted-foreground"
                    aria-label={
                      showConfirmation
                        ? "Ocultar confirmação de senha"
                        : "Mostrar confirmação de senha"
                    }
                    title={
                      showConfirmation
                        ? "Ocultar confirmação de senha"
                        : "Mostrar confirmação de senha"
                    }
                    aria-pressed={showConfirmation}
                    disabled={busy}
                    onClick={() => setShowConfirmation(!showConfirmation)}
                  >
                    {showConfirmation ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {fieldError("confirmation")}
              </div>
            )}
            {failure && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive"
              >
                {failure}
              </p>
            )}
            {success && (
              <div
                role="status"
                className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm leading-relaxed"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>{success}</p>
              </div>
            )}
            <Button type="submit" variant="hero" className="h-12 rounded-lg" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Aguarde…
                </>
              ) : (
                <>
                  {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                ou continue com
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                  disabled={busy}
                  onClick={() => oauth("google")}
                >
                  <GoogleG /> Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                  disabled={busy}
                  onClick={() => oauth("lovable")}
                >
                  <LovableMark className="!size-[18px]" /> Lovable
                </Button>
              </div>
            </>
          )}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-1 text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Ainda não tem conta?
                <Button
                  variant="link"
                  disabled={busy}
                  onClick={() => changeMode("signup")}
                  className="h-auto px-1 py-1"
                >
                  Criar uma conta
                </Button>
              </>
            ) : (
              <>
                {mode === "signup" ? "Já tem uma conta?" : "Lembrou sua senha?"}
                <Button
                  variant="link"
                  disabled={busy}
                  onClick={() => changeMode("login")}
                  className="h-auto px-1 py-1"
                >
                  Voltar ao login
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
