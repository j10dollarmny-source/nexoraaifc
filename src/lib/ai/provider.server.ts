/**
 * Ponto de integração com o provedor de IA (servidor apenas).
 * Nenhum provedor está conectado ainda. Para ativar, implemente `generateReply`
 * chamando o provedor escolhido e use as configurações do chatbot do usuário.
 */
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
