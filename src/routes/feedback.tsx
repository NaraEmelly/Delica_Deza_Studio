import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { meta, PageHead } from "@/components/SiteShell";
import { SERVICES, waLink } from "@/lib/salon";

export const Route = createFileRoute("/feedback")({
  head: () => meta("Avalie seu atendimento — Delica Deza", "Conte como foi sua experiência no Delica Deza e ajude a gente a melhorar."),
  component: Page,
});

function Page() {
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [service, setService] = useState(SERVICES[0]!.name);
  const [text, setText] = useState("");
  const msg = `Feedback Delica Deza\n${"★".repeat(stars)}${"☆".repeat(5 - stars)}\nNome: ${name}\nServiço: ${service}\n${text}`;

  return (
    <>
      <PageHead kicker="Sua opinião" title="Como foi seu atendimento?">Seu feedback chega direto para a nossa equipe.</PageHead>
      <section className="mx-auto max-w-xl px-5 py-12 space-y-5">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} estrelas`}>
              <Star size={36} className={n <= stars ? "fill-accent text-accent" : "text-border"} />
            </button>
          ))}
        </div>
        <input className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="field" value={service} onChange={(e) => setService(e.target.value)}>
          {SERVICES.map((s) => <option key={s.id}>{s.name}</option>)}
        </select>
        <textarea className="field min-h-32" placeholder="Conte pra gente como foi…" value={text} onChange={(e) => setText(e.target.value)} />
        <a href={waLink(msg)} target="_blank" rel="noreferrer" className="btn-gold w-full">Enviar feedback</a>
      </section>
    </>
  );
}
