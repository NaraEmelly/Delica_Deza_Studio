export interface BookingMessageDetails {
  service: string;
  servicePrice: string;
  serviceDuration: string;
  fiberColor: string;
  date: string;
  time: string;
  name: string;
  socialName: string;
  gender: string;
  hadRecentChemical: boolean;
  lastChemical: string;
  braidedBefore: boolean;
  hairType: string;
  paymentMethod: string;
  inspirationPhotoNames: string[];
  personalPhotoName: string;
}

export function buildBookingMessage(details: BookingMessageDetails) {
  const lines = [
    "📋 PEDIDO DE AGENDAMENTO — DELICA DEZA",
    "",
    "ATENDIMENTO",
    `• Serviço: ${details.service}`,
    `• Valor inicial: ${details.servicePrice}`,
    `• Duração aproximada: ${details.serviceDuration}`,
    `• Cor da fibra: ${details.fiberColor}`,
    `• Data desejada: ${details.date}`,
    `• Horário desejado: ${details.time}`,
    "",
    "DADOS DA CLIENTE",
    `• Nome: ${details.name}`,
    ...(details.socialName ? [`• Nome social: ${details.socialName}`] : []),
    `• Identidade de gênero: ${details.gender}`,
    "",
    "INFORMAÇÕES DO CABELO",
    `• Procedimento químico recente: ${details.hadRecentChemical ? `Sim — último procedimento ${details.lastChemical.toLowerCase()}` : "Não"}`,
    `• Já colocou tranças: ${details.braidedBefore ? "Sim" : "Não"}`,
    `• Curvatura: ${details.hairType}`,
    "",
    "PAGAMENTO",
    `• Forma preferida: ${details.paymentMethod}`,
    "",
    "FOTOS ANEXADAS",
    ...(details.inspirationPhotoNames.length > 0
      ? details.inspirationPhotoNames.map((name, index) => `• Referência ${index + 1}: ${name}`)
      : ["• Nenhuma foto de referência"]),
    ...(details.personalPhotoName
      ? [`• Foto do cabelo: ${details.personalPhotoName}`]
      : ["• Foto do cabelo: não enviada"]),
    "",
    "Por favor, confirme a disponibilidade e o valor final do serviço.",
  ];

  return lines.join("\n");
}
