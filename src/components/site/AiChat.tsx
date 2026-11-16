import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "./Logo";
import type { FreeModel } from "@/lib/ai/free-models";

export function AiChat({
  threadId,
  initialMessages,
  models,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  models: FreeModel[];
}) {
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [text, setText] = useState("");
  const [failure, setFailure] = useState("");
  const selected = useRef(model);
  selected.current = model;
  const textarea = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { threadId, model: selected.current, message: messages.at(-1) },
        }),
      }),
    [threadId],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => setFailure(e.message),
    onFinish: () => textarea.current?.focus(),
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (!busy) textarea.current?.focus();
  }, [busy]);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
        <h1 className="min-w-0 text-xl font-semibold">Assistente IA</h1>
        <Select value={model} onValueChange={setModel} disabled={busy || !models.length}>
          <SelectTrigger aria-label="Modelo gratuito" className="w-40 sm:w-64">
            <SelectValue placeholder="Sem modelo gratuito" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Conversation className="min-h-0">
        <ConversationContent className="mx-auto w-full max-w-3xl py-8">
          {!messages.length && (
            <div className="flex flex-col items-center gap-5 py-16">
              <Logo />
              <h2 className="text-2xl font-semibold">Como posso ajudar?</h2>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : ""
                }
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null,
                )}
              </MessageContent>
              {m.role === "assistant" &&
                !!m.metadata &&
                typeof m.metadata === "object" &&
                "model" in m.metadata && (
                  <span className="text-xs text-muted-foreground">{String(m.metadata.model)}</span>
                )}
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Preparando resposta…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="mx-auto w-full max-w-3xl pt-3">
        {failure && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {failure}
          </p>
        )}
        <PromptInput
          onSubmit={async () => {
            if (!text.trim() || busy || !model) return;
            setFailure("");
            const message = text.trim();
            setText("");
            await sendMessage({ text: message });
            textarea.current?.focus();
          }}
        >
          <PromptInputTextarea
            ref={textarea}
            autoFocus
            aria-label="Mensagem"
            placeholder="Digite sua mensagem…"
            value={text}
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
            disabled={busy || !model}
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={status}
              onStop={() => stop()}
              disabled={!busy && (!text.trim() || !model)}
              aria-label={busy ? "Parar resposta" : "Enviar mensagem"}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
