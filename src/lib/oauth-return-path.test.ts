import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";
describe("OAuth login return", () => {
  it("preserves the consent authorization request", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#confirm")).toBe("/.lovable/oauth/consent?authorization_id=abc#confirm");
  });
  it("rejects external redirect paths", () => {
    for (const path of ["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/\nother"]) expect(oauthReturnPath(path)).toBe("/");
  });
});