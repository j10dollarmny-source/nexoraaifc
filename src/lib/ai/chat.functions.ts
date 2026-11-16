import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getFreeModels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const key = process.env["OPENROUTER_API_KEY"];
    if (!key) throw new Error("Chave OpenRouter não configurada.");
    const { fetchFreeCatalog } = await import("./provider.server");
    return fetchFreeCatalog(key);
  });
export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_threads")
      .select("id,title")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  });
export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ai_threads")
      .insert({ user_id: context.userId })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  });
export const loadThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: thread, error: te } = await context.supabase
      .from("ai_threads")
      .select("id,title")
      .eq("id", data.id)
      .single();
    if (te || !thread) throw new Error("Conversa não encontrada.");
    const { data: rows, error } = await context.supabase
      .from("ai_messages")
      .select("message")
      .eq("thread_id", data.id)
      .order("created_at");
    if (error) throw error;
    return { thread, messagesJson: JSON.stringify(rows.map((r) => r.message)) };
  });
