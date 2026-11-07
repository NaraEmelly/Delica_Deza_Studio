import { describe, expect, it } from "vitest";

import { buildBookingMessage } from "@/lib/booking-message";

const booking = {
  service: "Box Braids",
  servicePrice: "R$ 280,00",
  serviceDuration: "5h",
  date: "10/11/2026",
  time: "10:00",
  name: "Ana Silva",
  socialName: "Ana",
  gender: "Mulher",
  hadRecentChemical: true,
  lastChemical: "De 1 a 3 meses",
  braidedBefore: false,
  hairType: "3B — Cacheado",
  paymentMethod: "Pix",
  inspirationPhotoNames: ["modelo.jpg", "referencia.png"],
  personalPhotoName: "meu-cabelo.jpg",
};

describe("buildBookingMessage", () => {
  it("creates an organized appointment note with the submitted details and photos", () => {
    const message = buildBookingMessage(booking);

    expect(message).toContain("📋 PEDIDO DE AGENDAMENTO — DELICA DEZA");
    expect(message).toContain("• Serviço: Box Braids");
    expect(message).toContain("• Nome social: Ana");
    expect(message).toContain("• Procedimento químico recente: Sim — último procedimento de 1 a 3 meses");
    expect(message).toContain("• Já colocou tranças: Não");
    expect(message).toContain("• Curvatura: 3B — Cacheado");
    expect(message).toContain("• Forma preferida: Pix");
    expect(message).toContain("• Referência 2: referencia.png");
    expect(message).toContain("• Foto do cabelo: meu-cabelo.jpg");
  });

  it("identifies optional social name and photos that were not provided", () => {
    const message = buildBookingMessage({
      ...booking,
      socialName: "",
      hadRecentChemical: false,
      lastChemical: "",
      braidedBefore: true,
      inspirationPhotoNames: [],
      personalPhotoName: "",
    });

    expect(message).not.toContain("Nome social:");
    expect(message).toContain("• Procedimento químico recente: Não");
    expect(message).toContain("• Já colocou tranças: Sim");
    expect(message).toContain("• Nenhuma foto de referência");
    expect(message).toContain("• Foto do cabelo: não enviada");
  });
});
