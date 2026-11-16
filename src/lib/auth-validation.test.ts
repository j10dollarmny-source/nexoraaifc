import { describe, expect, it } from "vitest";
import { validateAuth } from "./auth-validation";

const valid = {
  name: "Maria Silva",
  email: "maria@example.com",
  password: "segura123",
  confirmation: "segura123",
};

describe("account validation", () => {
  it("rejects invalid email in signup, login and recovery", () => {
    for (const mode of ["signup", "login", "forgot"] as const) {
      expect(validateAuth(mode, { ...valid, email: "maria-sem-email" }).success).toBe(false);
    }
  });
  it("rejects different signup passwords", () => {
    expect(validateAuth("signup", { ...valid, confirmation: "outra123" }).success).toBe(false);
    expect(validateAuth("signup", valid).success).toBe(true);
  });
  it("requires a name and preserves the existing six-character signup minimum", () => {
    expect(validateAuth("signup", { ...valid, name: " " }).success).toBe(false);
    expect(
      validateAuth("signup", { ...valid, password: "12345", confirmation: "12345" }).success,
    ).toBe(false);
    expect(
      validateAuth("signup", { ...valid, password: "123456", confirmation: "123456" }).success,
    ).toBe(true);
  });
});
