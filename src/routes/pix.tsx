import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { meta, PageHead } from "@/components/SiteShell";
import { SALON, SERVICES, brl } from "@/lib/salon";
import { pixPayload } from "@/lib/pix";

export const Route = createFileRoute("/pix")({
  validateSearch: (s: Record<string, unknown>) => ({
    v: typeof s.v === "number" ? s.v : undefined,
    d: typeof s.d === "string" ? s.d : undefined,
  }),
  head: () => meta("Pagar com Pix — Delica Deza", "Gere o QR Code e o código Pix copia e cola para pagar seu sinal ou serviço."),
  component: Page,
});

function Page() {
  const { v } = Route.useSearch();
  const [amount, setAmount] = useState(v ? String(v) : "");
  const value = parseFloat(amount.replace(",", ".")) || 0;
  const code = pixPayload({ key: SALON.pixKey, name: SALON.pixName, city: SALON.pixCity, amount: value });

  return (
    <>
      <PageHead kicker="Financeiro" title="Pague com Pix">Escolha o valor do sinal ou serviço e pague pelo app do seu banco.</PageHead>
      <section className="mx-auto max-w-4xl px-5 py-12 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-muted-foreground">Valor (R$)</span>
            <input className="field mt-1 text-2xl font-display" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </label>
          <div className="flex flex-wrap gap-2">
            {[50, 100].map((n) => (
              <button key={n} onClick={() => setAmount(String(n))} className="rounded-full border bg-card px-3 py-1 text-sm">Sinal {brl(n)}</button>
            ))}
            {SERVICES.slice(0, 4).map((s) => (
              <button key={s.id} onClick={() => setAmount(String(s.price))} className="rounded-full border bg-card px-3 py-1 text-sm">{s.name}</button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Recebedor: <b className="text-foreground">{SALON.pixName}</b><br />Chave: {SALON.pixKey}</p>
        </div>
        <div className="rounded-3xl bg-ink text-ink-foreground p-6 text-center">
          <div className="inline-block rounded-2xl bg-card p-4">
            <QRCodeSVG value={code} size={200} />
          </div>
          <p className="mt-4 font-display text-3xl text-gold">{value ? brl(value) : "Valor livre"}</p>
          <p className="mt-3 break-all text-xs opacity-60">{code}</p>
          <button className="btn-gold mt-4 w-full" onClick={() => { navigator.clipboard.writeText(code); toast.success("Código Pix copiado!"); }}>
            <Copy size={16} /> Copiar Pix copia e cola
          </button>
        </div>
      </section>
    </>
  );
}
