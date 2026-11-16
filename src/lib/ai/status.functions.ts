import { createServerFn } from "@tanstack/react-start";

export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isAiConfigured } = await import("./provider.server");
  return { connected: isAiConfigured() };
});
