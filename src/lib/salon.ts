// Dados do salão — substitua pelos dados reais.
export const SALON = {
  name: "Delica Deza",
  whatsapp: "5522988328434",
  email: "delicadezacomesticos@hotmail.com",
  instagram: "delicadeza_oficial",
  address: "Rua José Mariano Coutinho, 2, Retiro, Saquarema RJ, 28995-101, Brasil",
};

export const SERVICES = [
  { id: "knotles", name: "Knotles" },
  { id: "entrelace", name: "Entrelace" },
  { id: "nago", name: "Nagô" },
  { id: "nago-desenhada", name: "Nagô desenhada" },
  { id: "nago-topo", name: "Nagô topo" },
  { id: "fulani-organico", name: "Fulani com orgânico" },
  { id: "bon-braids", name: "Bon Braids" },
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

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const waLink = (text: string) =>
  `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
