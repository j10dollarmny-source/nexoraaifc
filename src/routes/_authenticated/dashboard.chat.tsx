import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createThread, listThreads } from "@/lib/ai/chat.functions";

const threadsQuery = { queryKey: ["ai-threads"], queryFn: () => listThreads() };
export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  loader: ({ context }) => context.queryClient.ensureQueryData(threadsQuery),
  head: () => ({
    meta: [
      { title: "Assistente IA — Nexora AI" },
      {
        name: "description",
        content: "Converse com o assistente e consulte suas conversas privadas.",
      },
      { property: "og:title", content: "Assistente IA — Nexora AI" },
      {
        property: "og:description",
        content: "Assistente empresarial com modelos gratuitos verificados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatLayout,
});
function ChatLayout() {
  const { data: threads } = useSuspenseQuery(threadsQuery);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="flex h-[calc(100dvh-190px)] min-h-96 flex-col gap-5 md:h-[calc(100dvh-80px)] md:flex-row">
      <aside className="flex shrink-0 flex-col gap-3 md:w-48">
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const thread = await createThread();
              await qc.invalidateQueries({ queryKey: ["ai-threads"] });
              await navigate({ to: "/dashboard/chat/$threadId", params: { threadId: thread.id } });
            } catch (e) {
              setError(e instanceof Error ? e.message : "Erro ao criar conversa.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Plus />
          Nova conversa
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <nav aria-label="Conversas" className="flex gap-2 overflow-auto md:flex-col">
          {threads.map((t) => (
            <Link
              key={t.id}
              to="/dashboard/chat/$threadId"
              params={{ threadId: t.id }}
              className="max-w-48 shrink-0 truncate rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary [&.active]:bg-secondary [&.active]:text-foreground"
            >
              {t.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
