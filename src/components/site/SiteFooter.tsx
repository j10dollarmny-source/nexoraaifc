import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/solucoes" className="hover:text-foreground">Soluções</Link>
          <Link to="/precos" className="hover:text-foreground">Preços</Link>
          <Link to="/auth" className="hover:text-foreground">Login</Link>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Nexora AI</p>
      </div>
      <div className="site-wordmark mx-auto max-w-6xl overflow-hidden px-5 pb-8" aria-hidden="true">Nexora AI</div>
    </footer>
  );
}
