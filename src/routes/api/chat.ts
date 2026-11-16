import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = process.env["SUPABASE_URL"],
          publishable = process.env["SUPABASE_PUBLISHABLE_KEY"],
          key = process.env["OPENROUTER_API_KEY"];
        if (!url || !publishable || !key)
          return Response.json({ error: "Assistente não configurado." }, { status: 503 });
        if (
          request.headers.get("origin") &&
          request.headers.get("origin") !== new URL(request.url).origin
        )
          return Response.json({ error: "Origem inválida." }, { status: 403 });
        const { authenticateChat } = await import("@/lib/ai/chat-auth.server");
        let auth;
        try {
          auth = await authenticateChat(request, url, publishable);
        } catch {
          return Response.json({ error: "Entre na sua conta para conversar." }, { status: 401 });
        }
        try {
          if (Number(request.headers.get("content-length") || 0) > 12000)
            return Response.json({ error: "Mensagem muito longa." }, { status: 400 });
          const input = z
            .object({
              threadId: z.string().uuid(),
              model: z.string().max(200).optional(),
              message: z.object({
                id: z.string().min(1).max(120),
                role: z.literal("user"),
                parts: z
                  .array(z.object({ type: z.literal("text"), text: z.string().min(1).max(2000) }))
                  .min(1)
                  .max(1),
              }),
            })
            .parse(await request.json());
          const { streamFreeChat, ProviderError } = await import("@/lib/ai/provider.server");
          try {
            return await streamFreeChat({
              key,
              client: auth.client,
              userId: auth.userId,
              threadId: input.threadId,
              message: input.message,
              selected: input.model,
              signal: request.signal,
            });
          } catch (error) {
            if (request.signal.aborted) return new Response(null, { status: 499 });
            return Response.json(
              { error: error instanceof Error ? error.message : "Falha ao conversar." },
              { status: error instanceof ProviderError ? error.status : 500 },
            );
          }
        } catch {
          return Response.json(
            { error: "Mensagem inválida. Use até 2000 caracteres." },
            { status: 400 },
          );
        }
      },
    },
  },
});
