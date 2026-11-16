import { describe, expect, it } from "vitest";
import { PLANS } from "./plans";

describe("planos", () => {
  it("oferece exatamente Grátis, Pro e Business", () => {
    expect(PLANS.map((p) => p.name)).toEqual(["Grátis", "Pro", "Business"]);
  });
  it("o plano Grátis custa zero", () => {
    expect(PLANS.find((p) => p.id === "free")?.price).toBe(0);
  });
});
