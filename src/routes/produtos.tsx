import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import img from "@/assets/produtos.jpg";
import { meta, PageHead } from "@/components/SiteShell";
import { PRODUCTS, brl, waLink } from "@/lib/salon";

export const Route = createFileRoute("/produtos")({
  head: () => meta("Produtos — Delica Deza", "Óleos, sprays, máscaras e acessórios para cuidar das suas tranças em casa."),
  component: Page,
});

function Page() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const set = (n: string, d: number) => setCart((c) => ({ ...c, [n]: Math.max(0, (c[n] || 0) + d) }));
  const items = PRODUCTS.filter((p) => cart[p.name]);
  const total = items.reduce((s, p) => s + p.price * cart[p.name], 0);
  const msg = `Olá! Quero encomendar:\n${items.map((p) => `• ${cart[p.name]}x ${p.name}`).join("\n")}\nTotal: ${brl(total)}`;

  return (
    <>
      <PageHead kicker="Loja" title="Cuidados para levar">Produtos selecionados para manter suas tranças lindas por mais tempo.</PageHead>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <img src={img} loading="lazy" width={1024} height={768} alt="Produtos capilares" className="rounded-3xl w-full aspect-[16/7] object-cover" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="rounded-2xl bg-card border p-5 flex items-center justify-between">
              <div>
                <p className="font-display text-lg">{p.name}</p>
                <p className="text-secondary">{brl(p.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => set(p.name, -1)} className="rounded-full border p-2" aria-label="Menos"><Minus size={14} /></button>
                <span className="w-4 text-center">{cart[p.name] || 0}</span>
                <button onClick={() => set(p.name, 1)} className="rounded-full bg-primary text-primary-foreground p-2" aria-label="Mais"><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        {total > 0 && (
          <div className="sticky bottom-4 mt-8 rounded-2xl bg-ink text-ink-foreground p-5 flex flex-wrap items-center justify-between gap-3 shadow-soft">
            <p className="flex items-center gap-2"><ShoppingBag size={18} /> Total: <b className="text-accent">{brl(total)}</b></p>
            <div className="flex gap-2">
              <Link to="/pix" search={{ v: total, d: "Produtos" }} className="btn-ghost !py-2">Pagar com Pix</Link>
              <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-gold !py-2">Pedir no WhatsApp</a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
