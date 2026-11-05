const f = (id: string, v: string) => id + String(v.length).padStart(2, "0") + v;

export function crc16(str: string) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const clean = (s: string, max: number) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().slice(0, max);

/** Gera o código "Pix Copia e Cola" (BR Code estático). */
export function pixPayload(o: { key: string; name: string; city: string; amount?: number; txid?: string }) {
  let p =
    f("00", "01") +
    f("26", f("00", "br.gov.bcb.pix") + f("01", o.key)) +
    f("52", "0000") +
    f("53", "986") +
    (o.amount && o.amount > 0 ? f("54", o.amount.toFixed(2)) : "") +
    f("58", "BR") +
    f("59", clean(o.name, 25)) +
    f("60", clean(o.city, 15)) +
    f("62", f("05", (o.txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")) +
    "6304";
  return p + crc16(p);
}
