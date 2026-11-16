import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Início" },
  { to: "/solucoes", label: "Soluções" },
  { to: "/precos", label: "Preços" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button asChild variant="hero" size="sm"><Link to="/dashboard">Painel</Link></Button>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
              <Button asChild variant="hero" size="sm"><Link to="/auth" search={{ mode: "signup" }}>Começar grátis</Link></Button>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="animate-fade-up border-t border-border px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground">{l.label}</Link>
            ))}
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 text-primary">Painel</Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-md px-2 py-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground">Login</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
