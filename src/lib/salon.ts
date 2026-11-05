// Dados do salão — substitua pelos dados reais.
export const SALON = {
  name: "Delica Deza",
  whatsapp: "5511999999999",
  pixKey: "delicadeza@email.com",
  pixName: "DELICA DEZA",
  pixCity: "SAO PAULO",
  instagram: "delicadeza",
  address: "Rua das Tranças, 123 — São Paulo",
};

export const SERVICES = [
  { id: "box", name: "Box Braids", time: "5h", price: 280 },
  { id: "knotless", name: "Knotless Braids", time: "6h", price: 350 },
  { id: "fulani", name: "Fulani Braids", time: "4h", price: 260 },
  { id: "nago", name: "Tranças Nagô", time: "2h", price: 150 },
  { id: "twist", name: "Twist / Passion Twist", time: "4h", price: 300 },
  { id: "manut", name: "Manutenção", time: "1h30", price: 90 },
  { id: "hidra", name: "Hidratação & Cronograma", time: "1h", price: 80 },
];

export const PRODUCTS = [
  { name: "Óleo Capilar Nutritivo", price: 45 },
  { name: "Spray Hidratante p/ Tranças", price: 39 },
  { name: "Máscara de Manteiga de Karité", price: 59 },
  { name: "Sérum para Couro Cabeludo", price: 49 },
  { name: "Anéis Dourados (kit 20)", price: 25 },
  { name: "Touca de Cetim", price: 35 },
];

export const HOURS = ["08:00", "10:00", "13:00", "15:00", "17:00"];
// 0=domingo. Abertos de terça a sábado.
export const OPEN_DAYS = [2, 3, 4, 5, 6];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const waLink = (text: string) =>
  `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
