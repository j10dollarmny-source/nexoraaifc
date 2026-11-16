import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
export const Route = createFileRoute("/_authenticated/dashboard/chat/")({
  head: () => ({
    meta: [
      { title: "Conversas — KAVROM" },
      { name: "description", content: "Suas conversas privadas com o assistente IA." },
      { property: "og:title", content: "Conversas — KAVROM" },
      { property: "og:description", content: "Histórico de conversas do assistente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Logo />
      <h1 className="text-2xl font-semibold">Suas conversas</h1>
    </div>
  ),
});
