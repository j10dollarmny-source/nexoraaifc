import { Link } from "@tanstack/react-router";
import logoSymbol from "@/assets/kavrom-symbol.png.asset.json";

export function Logo() {
  return (
    <Link to="/" className="flex h-10 w-9 shrink-0 items-center justify-center text-foreground" aria-label="Nexora AI — início">
      <span className="block h-10 w-9 bg-current" style={{ maskImage: `url(${logoSymbol.url})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} aria-hidden="true" />
    </Link>
  );
}
