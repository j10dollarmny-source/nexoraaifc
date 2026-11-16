import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getFreeModels, loadThread } from "@/lib/ai/chat.functions";
import { AiChat } from "@/components/site/AiChat";
import type { UIMessage } from "ai";
const modelQuery = {
  queryKey: ["free-ai-models"],
  queryFn: () => getFreeModels(),
  staleTime: 300000,
};
const threadQuery = (id: string) => ({
  queryKey: ["ai-thread", id],
  queryFn: () => loadThread({ data: { id } }),
  staleTime: 0,
});
export const Route = createFileRoute("/_authenticated/dashboard/chat/$threadId")({
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(modelQuery),
      context.queryClient.ensureQueryData(threadQuery(params.threadId)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Conversa com IA — KAVROM" },
      {
        name: "description",
        content: "Converse com modelos gratuitos de inteligência artificial.",
      },
      { property: "og:title", content: "Conversa com IA — KAVROM" },
      { property: "og:description", content: "Conversa privada com o assistente empresarial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Thread,
});
function Thread() {
  const { threadId } = Route.useParams();
  const { data } = useSuspenseQuery(threadQuery(threadId));
  const { data: models } = useSuspenseQuery(modelQuery);
  return (
    <AiChat
      key={threadId}
      threadId={threadId}
      initialMessages={JSON.parse(data.messagesJson) as UIMessage[]}
      models={models}
    />
  );
}
