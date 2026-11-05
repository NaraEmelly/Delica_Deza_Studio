import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { meta, PageHead } from "@/components/SiteShell";
import { HOURS, OPEN_DAYS, SERVICES, brl, waLink } from "@/lib/salon";

export const Route = createFileRoute("/agendar")({
  validateSearch: (q: Record<string, unknown>): { s?: string } => (typeof q["s"] === "string" ? { s: q["s"] } : {}),
  head: () => meta("Agendar horário — Delica Deza", "Escolha o serviço, veja os dias disponíveis e agende seu horário no Delica Deza."),
  component: Page,
});

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

function Page() {
  const { s } = Route.useSearch();
  const [service, setService] = useState<string>(s ?? SERVICES[0]!.id);
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [name, setName] = useState("");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = useMemo(() => {
    const first = month.getDay();
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const sv = SERVICES.find((x) => x.id === service) ?? SERVICES[0]!;
  const ok = day && hour && name.trim();
  const msg = ok ? `Olá! Gostaria de agendar:\n• Serviço: ${sv.name}\n• Data: ${day!.toLocaleDateString("pt-BR")} às ${hour}\n• Nome: ${name}` : "";

  return (
    <>
      <PageHead kicker="Agenda" title="Marque seu horário">Atendemos de terça a sábado. Escolha um dia disponível.</PageHead>
      <section className="mx-auto max-w-3xl px-5 py-12 space-y-8">
        <div>
          <p className="font-display text-xl mb-3">1. Serviço</p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((x) => (
              <button key={x.id} onClick={() => setService(x.id)}
                className={`rounded-full border px-4 py-2 text-sm ${service === x.id ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
                {x.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{sv.time} · a partir de {brl(sv.price)}</p>
        </div>

        <div>
          <p className="font-display text-xl mb-3">2. Dia</p>
          <div className="rounded-2xl bg-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mês anterior"><ChevronLeft /></button>
              <p className="capitalize font-medium">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Próximo mês"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {WEEK.map((w, i) => <span key={i} className="text-muted-foreground py-1">{w}</span>)}
              {days.map((d, i) => {
                if (!d) return <span key={i} />;
                const free = d >= today && OPEN_DAYS.includes(d.getDay());
                const sel = day?.toDateString() === d.toDateString();
                return (
                  <button key={i} disabled={!free} onClick={() => { setDay(d); setHour(null); }}
                    className={`aspect-square rounded-full ${sel ? "bg-gold text-ink font-semibold" : free ? "hover:bg-muted text-foreground" : "text-muted-foreground/40 line-through"}`}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {day && (
          <div>
            <p className="font-display text-xl mb-3">3. Horário</p>
            <div className="flex flex-wrap gap-2">
              {HOURS.map((h) => (
                <button key={h} onClick={() => setHour(h)}
                  className={`rounded-full border px-4 py-2 ${hour === h ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card"}`}>{h}</button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="font-display text-xl mb-3">4. Seu nome</p>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" />
        </div>

        <a href={ok ? waLink(msg) : undefined} target="_blank" rel="noreferrer"
          className={`btn-gold w-full ${ok ? "" : "pointer-events-none opacity-50"}`}>
          Confirmar pelo WhatsApp
        </a>
      </section>
    </>
  );
}
