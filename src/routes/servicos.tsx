import { createFileRoute, Link } from "@tanstack/react-router";
import { meta, PageHead } from "@/components/SiteShell";
import { SERVICES } from "@/lib/salon";

export const Route = createFileRoute("/servicos")({
  head: () =>
    meta("Serviços — Delica Deza", "Conheça os tipos de tranças oferecidos pelo Delica Deza."),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead kicker="Catálogo" title="Nossos serviços">
        Escolha seu estilo e fale com a profissional pelo WhatsApp para saber os valores e detalhes.
      </PageHead>
      <section className="mx-auto max-w-6xl px-5 py-12 grid gap-4 md:grid-cols-2">
        {SERVICES.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl bg-card border p-6 flex items-center justify-between gap-4"
          >
            <h3 className="text-2xl">{s.name}</h3>
            <Link to="/agendar" search={{ s: s.id }} className="text-sm text-primary underline">
              Agendar
            </Link>
          </div>
        ))}
      </section>
    </>
  );
}
