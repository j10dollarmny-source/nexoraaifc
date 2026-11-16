export type FreeModel = { id: string; name: string };
export function verifiedFreeModels(models: unknown): FreeModel[] {
  if (!Array.isArray(models)) return [];
  return models
    .filter((m) => {
      if (!m || typeof m.id !== "string" || !m.id.endsWith(":free") || !m.pricing) return false;
      const prices = Object.values(m.pricing);
      return (
        prices.length >= 2 &&
        m.pricing.prompt !== undefined &&
        m.pricing.completion !== undefined &&
        prices.every(
          (p) =>
            (typeof p === "string" || typeof p === "number") &&
            String(p).trim() !== "" &&
            Number(p) === 0,
        ) &&
        (!m.architecture?.output_modalities || m.architecture.output_modalities.includes("text"))
      );
    })
    .map((m) => ({ id: m.id, name: m.name || m.id }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
export function freeCandidates(models: FreeModel[], requested?: string) {
  const selected = models.find((m) => m.id === requested) ?? models[0];
  if (!selected) return [];
  return [selected, ...models.filter((m) => m.id !== selected.id)].slice(0, 3);
}
export const INPUT_LIMIT = 2000;
export const OUTPUT_LIMIT = 384;
export function compactContext(
  messages: { role: string; parts: { type: string; text?: string }[] }[],
) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-6)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("\n")
        .slice(0, INPUT_LIMIT),
    }));
}
