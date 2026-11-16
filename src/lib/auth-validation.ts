import { z } from "zod";

export type AuthMode = "login" | "signup" | "forgot";

const email = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(255, "E-mail muito longo.")
  .email("Informe um e-mail válido.");
const password = z
  .string()
  .min(6, "A senha deve ter pelo menos 6 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.");
const signup = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe seu nome completo.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
    email,
    password,
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "As senhas não coincidem.",
  });

export function validateAuth(mode: AuthMode, input: Record<string, string>) {
  if (mode === "signup") return signup.safeParse(input);
  if (mode === "forgot") return z.object({ email }).safeParse(input);
  return z
    .object({
      email,
      password: z.string().min(1, "Informe sua senha.").max(128, "Senha muito longa."),
    })
    .safeParse(input);
}

export function authError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials/i.test(message))
    return "E-mail ou senha incorretos. Tente novamente.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar.";
  if (/already registered|already been registered/i.test(message))
    return "Este e-mail já está cadastrado. Entre na sua conta.";
  if (/rate limit|too many|security purposes/i.test(message))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (/weak|password/i.test(message))
    return "Essa senha não atende aos requisitos de segurança. Escolha uma senha mais forte.";
  if (/fetch|network/i.test(message))
    return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
  return "Não foi possível concluir. Tente novamente em instantes.";
}
