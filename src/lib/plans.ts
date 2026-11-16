export type Plan = {
  id: "free" | "pro" | "business";
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Grátis",
    price: 0,
    tagline: "Recursos básicos para começar.",
    features: ["1 chatbot de atendimento", "Até 100 conversas/mês", "Painel com estatísticas básicas", "Suporte por e-mail"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    tagline: "Automações avançadas para crescer.",
    features: ["3 chatbots", "Até 5.000 conversas/mês", "Automação de mensagens", "Assistente de vendas", "Geração de textos comerciais"],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: 499,
    tagline: "Recursos completos para empresas.",
    features: ["Chatbots ilimitados", "Conversas ilimitadas", "Todas as automações", "Relatórios avançados", "Suporte prioritário"],
  },
];

export function formatPrice(value: number) {
  return value === 0 ? "R$ 0" : `R$ ${value.toLocaleString("pt-BR")}`;
}
