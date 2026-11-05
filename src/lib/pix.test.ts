import { describe, it, expect } from "vitest";
import { crc16, pixPayload } from "./pix";

describe("pix", () => {
  it("crc16 matches CCITT-FALSE reference", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
  it("includes the amount and a valid CRC", () => {
    const p = pixPayload({ key: "a@b.com", name: "Delica Deza", city: "São Paulo", amount: 150 });
    expect(p).toContain("5406150.00");
    expect(p.slice(-4)).toBe(crc16(p.slice(0, -4)));
  });
});
