import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Nexora AI" },
      { name: "description", content: "Acompanhe conversas, clientes atendidos e configure seu chatbot." },
      { property: "og:title", content: "Painel — Nexora AI" },
      { property: "og:description", content: "Painel de controle da Nexora AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { to: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
] as const;

function DashboardLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-border bg-sidebar md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between px-5"><Logo />
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground md:hidden" aria-label="Sair"><LogOut className="size-5" /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground [&.active]:bg-sidebar-accent [&.active]:text-foreground">
              <n.icon className="size-4" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-border p-4 md:block">
          <p className="truncate text-sm">{user.email}</p>
          <button onClick={signOut} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="size-4" /> Sair</button>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10 md:py-10"><Outlet /></main>
    </div>
  );
}
