import { describe, expect, it } from "vitest";
import { compactContext, freeCandidates, verifiedFreeModels } from "./free-models";
describe("Free-only model rules", () => {
  it("accepts only verified zero pricing, never name alone or paid extras", () => {
    const result = verifiedFreeModels([
      { id: "safe:free", pricing: { prompt: "0", completion: "0" } },
      { id: "paid:free", pricing: { prompt: "0", completion: "0.01" } },
      { id: "extra:free", pricing: { prompt: "0", completion: "0", request: "1" } },
      { id: "unknown:free" },
      { id: "named-free", pricing: { prompt: "0", completion: "0" } },
    ]);
    expect(result.map((m) => m.id)).toEqual(["safe:free"]);
  });
  it("switches and falls back only inside the verified free list", () => {
    const list = [
      { id: "a:free", name: "a" },
      { id: "b:free", name: "b" },
    ];
    expect(freeCandidates(list, "paid/model").map((m) => m.id)).toEqual(["a:free", "b:free"]);
    expect(freeCandidates(list, "b:free").map((m) => m.id)).toEqual(["b:free", "a:free"]);
  });
  it("bounds context to six messages of 2000 characters", () => {
    const result = compactContext(
      Array.from({ length: 12 }, () => ({
        role: "user",
        parts: [{ type: "text", text: "x".repeat(3000) }],
      })),
    );
    expect(result).toHaveLength(6);
    expect(result.every((m) => m.content.length === 2000)).toBe(true);
  });
});
