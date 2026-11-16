import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, type UIMessage } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { compactContext, freeCandidates, OUTPUT_LIMIT, verifiedFreeModels } from "./free-models";

export class ProviderError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function checkedJson(response: Response) {
  const body = await response.json();
  if (!response.ok)
    throw new ProviderError(body.error?.message || "OpenRouter indisponível.", response.status);
  return body;
}
export async function fetchFreeCatalog(key: string) {
  const body = await checkedJson(
    await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    }),
  );
  const models = verifiedFreeModels(body.data);
  if (!models.length) throw new ProviderError("Nenhum modelo gratuito verificado disponível.", 503);
  return models;
}
async function reserveRequest(key: string, client: SupabaseClient<Database>) {
  const info = await checkedJson(
    await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${key}` },
    }),
  );
  const quota = info.data?.free_model_daily_requests;
  if (!quota || !Number.isFinite(quota.remaining) || quota.remaining <= 0)
    throw new ProviderError(
      "Limite gratuito diário atingido ou não verificável. Tente amanhã.",
      429,
    );
  const { data, error } = await client.rpc("reserve_free_ai_request");
  if (error) throw new ProviderError("Não foi possível verificar o limite gratuito.", 503);
  if (!data)
    throw new ProviderError(
      "Limite gratuito atingido. Aguarde antes de enviar outra mensagem.",
      429,
    );
}
export async function streamFreeChat(options: {
  key: string;
  client: SupabaseClient<Database>;
  userId: string;
  threadId: string;
  message: UIMessage;
  selected?: string | undefined;
  signal: AbortSignal;
}) {
  const { key, client, userId, threadId, message, signal } = options;
  const models = await fetchFreeCatalog(key);
  const candidates = freeCandidates(models, options.selected);
  const primary = candidates[0];
  if (!primary) throw new ProviderError("Nenhum modelo gratuito disponível.", 503);
  const { data: thread, error: te } = await client
    .from("ai_threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", userId)
    .single();
  if (te || !thread) throw new ProviderError("Conversa não encontrada.", 404);
  const { data: history, error: he } = await client
    .from("ai_messages")
    .select("message")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (he) throw new ProviderError("Não foi possível carregar o histórico.", 500);
  const { error: se } = await client
    .from("ai_messages")
    .upsert(
      {
        thread_id: threadId,
        user_id: userId,
        sdk_id: message.id,
        message: JSON.parse(JSON.stringify(message)),
      },
      { onConflict: "thread_id,sdk_id" },
    );
  if (se) throw new ProviderError("Não foi possível salvar sua mensagem.", 500);
  const originals = [
    ...(history ?? []).reverse().map((r) => r.message as unknown as UIMessage),
    message,
  ];
  const modelMessages = compactContext(originals);
  const firstText = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ");
  const { error: ue } = await client
    .from("ai_threads")
    .update({
      updated_at: new Date().toISOString(),
      ...(!history?.length ? { title: firstText.slice(0, 60) } : {}),
    })
    .eq("id", threadId);
  if (ue) throw new ProviderError("Não foi possível atualizar a conversa.", 500);
  let usedModel = primary.id;
  const provider = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    headers: { Authorization: `Bearer ${key}` },
    fetch: async (input, init) => {
      const original = JSON.parse(String(init?.body));
      let last: Response | undefined;
      for (const [index, candidate] of candidates.entries()) {
        if (signal.aborted) throw new DOMException("Stopped", "AbortError");
        await reserveRequest(key, client);
        usedModel = candidate.id;
        const body = {
          ...original,
          model: candidate.id,
          provider: {
            max_price: { prompt: 0, completion: 0, request: 0, image: 0 },
            allow_fallbacks: true,
          },
          plugins: [],
        };
        const response = await fetch(input, { ...init, body: JSON.stringify(body), signal });
        // Only genuine model unavailability permits switching; never bypass refusals or quota errors.
        if ((response.status === 404 || response.status === 503) && index < candidates.length - 1) {
          last = response;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        if (!response.ok) {
          const errorBody = await response
            .clone()
            .json()
            .catch(() => ({}));
          throw new ProviderError(
            errorBody.error?.message || `OpenRouter (${response.status})`,
            response.status,
          );
        }
        return response;
      }
      if (last) return last;
      throw new ProviderError("Modelos gratuitos indisponíveis.", 503);
    },
  });
  const result = streamText({
    model: provider.chatModel(primary.id),
    system: "Responda em português, de forma breve e útil. Não invente informações.",
    messages: modelMessages,
    maxOutputTokens: OUTPUT_LIMIT,
    maxRetries: 0,
    abortSignal: signal,
  });
  return result.toUIMessageStreamResponse({
    originalMessages: originals,
    sendReasoning: false,
    messageMetadata: ({ part }) => (part.type === "finish" ? { model: usedModel } : undefined),
    onError: (error) =>
      error instanceof Error ? error.message : "Não foi possível concluir a resposta.",
    onFinish: async ({ responseMessage }) => {
      if (!responseMessage.parts.length) return;
      const { error } = await client
        .from("ai_messages")
        .upsert(
          {
            thread_id: threadId,
            user_id: userId,
            sdk_id: responseMessage.id,
            message: JSON.parse(JSON.stringify(responseMessage)),
          },
          { onConflict: "thread_id,sdk_id" },
        );
      if (error) throw new Error("Resposta recebida, mas o histórico não pôde ser salvo.");
    },
  });
}

// The customer-facing chatbot remains unconnected; this is a separate account assistant.
export type ChatTurn = { role: "user" | "assistant"; content: string };

export type BotConfig = {
  bot_name: string;
  tone: string;
  welcome_message: string;
  instructions: string;
};

export function buildSystemPrompt(cfg: BotConfig) {
  return [
    `Você é ${cfg.bot_name}, assistente virtual de atendimento.`,
    `Tom de voz: ${cfg.tone}.`,
    cfg.instructions && `Instruções da empresa: ${cfg.instructions}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function isAiConfigured() {
  return false;
}

export async function generateReply(_cfg: BotConfig, _history: ChatTurn[]): Promise<string> {
  throw new Error("AI_NOT_CONFIGURED");
}
