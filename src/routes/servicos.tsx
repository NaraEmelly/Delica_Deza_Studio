import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { meta, PageHead } from "@/components/SiteShell";
import { SERVICES, brl } from "@/lib/salon";

export const Route = createFileRoute("/servicos")({
  head: () => meta("Serviços e preços — Delica Deza", "Tabela de tranças e cuidados capilares do Delica Deza, com duração e valores."),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead kicker="Tabela" title="Serviços & valores">Valores iniciais; o preço final depende do tamanho e volume.</PageHead>
      <section className="mx-auto max-w-6xl px-5 py-12 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.id} className="rounded-2xl bg-card border p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl">{s.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Clock size={14} /> {s.time}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-secondary">{brl(s.price)}</p>
              <Link to="/agendar" search={{ s: s.id }} className="text-sm text-primary underline">Agendar</Link>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
