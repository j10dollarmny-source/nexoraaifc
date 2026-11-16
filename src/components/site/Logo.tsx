import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Nexora AI — início">
      <span className="relative grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-primary shadow-glow">
        <svg viewBox="0 0 24 24" className="size-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 18V6l12 12V6" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold">
        Nexora<span className="text-primary"> AI</span>
      </span>
    </Link>
  );
}
