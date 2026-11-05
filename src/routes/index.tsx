import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, QrCode, Sparkles, MessageSquareHeart } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import { meta } from "@/components/SiteShell";
import { SERVICES, brl } from "@/lib/salon";

export const Route = createFileRoute("/")({
  head: () => meta("Delica Deza — Salão de Tranças e Beleza", "Box braids, knotless, fulani e nagô. Agende online, pague com Pix e conheça nossos trabalhos."),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="bg-ink text-ink-foreground overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-accent">Studio de tranças</p>
            <h1 className="mt-4 text-5xl md:text-7xl leading-[1.02]">
              Beleza feita <em className="text-gold">fio a fio</em>.
            </h1>
            <p className="mt-5 max-w-md opacity-75">
              No Delica Deza cada trança é pensada para valorizar sua história, com carinho, técnica e muito charme.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/agendar" className="btn-gold">Agendar horário</Link>
              <Link to="/galeria" className="btn-ghost">Ver trabalhos</Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] border border-accent/40 rotate-2" />
            <img src={hero} width={1024} height={1280} alt="Cliente com tranças no Delica Deza" className="relative rounded-[2rem] object-cover aspect-[4/5] w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: "/agendar", icon: CalendarHeart, t: "Agendar", d: "Veja dias livres" },
          { to: "/pix", icon: QrCode, t: "Pix", d: "Gere seu código" },
          { to: "/produtos", icon: Sparkles, t: "Produtos", d: "Cuide em casa" },
          { to: "/feedback", icon: MessageSquareHeart, t: "Feedback", d: "Conte como foi" },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl bg-card border p-5 hover:shadow-soft transition-shadow">
            <c.icon className="text-primary" />
            <p className="mt-4 font-display text-xl">{c.t}</p>
            <p className="text-sm text-muted-foreground">{c.d}</p>
          </Link>
        ))}
      </section>

      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-16 grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
          <div className="grid grid-cols-2 gap-3">
            <img src={g1} loading="lazy" width={768} height={960} alt="Tranças com anéis dourados" className="rounded-2xl aspect-[4/5] object-cover" />
            <img src={g2} loading="lazy" width={768} height={960} alt="Fulani braids com miçangas" className="rounded-2xl aspect-[4/5] object-cover mt-8" />
          </div>
          <div>
            <h2 className="text-4xl">Nossos serviços</h2>
            <ul className="mt-6 divide-y divide-secondary-foreground/20">
              {SERVICES.slice(0, 5).map((s) => (
                <li key={s.id} className="flex justify-between py-3">
                  <span>{s.name}</span><span className="text-accent">a partir de {brl(s.price)}</span>
                </li>
              ))}
            </ul>
            <Link to="/servicos" className="btn-ghost mt-6">Ver todos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
