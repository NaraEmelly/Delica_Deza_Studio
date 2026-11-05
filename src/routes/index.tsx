import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, QrCode, Sparkles, MessageSquareHeart, Camera, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import { meta } from "@/components/SiteShell";
import { SERVICES, brl } from "@/lib/salon";

export const Route = createFileRoute("/")({
  head: () => meta("Delica Deza — Salão de Tranças e Beleza", "Box braids, knotless, fulani e nagô. Agende online, pague com Pix e conheça nossos trabalhos."),
  component: Index,
});

const STYLES = ["Box Braids", "Knotless", "Fulani", "Nagô", "Twist", "Boho Braids", "Gypsy", "Cachos"];
const WORKS = [
  { src: g1, n: "01", t: "Box com anéis dourados", tag: "Box Braids" },
  { src: hero, n: "02", t: "Nagô + soltas longas", tag: "Mista" },
  { src: g2, n: "03", t: "Fulani com miçangas de madeira", tag: "Fulani" },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="bg-ink text-ink-foreground grain overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="script text-3xl text-accent -rotate-2">feito à mão, com afeto</p>
            <h1 className="mt-2 text-5xl md:text-7xl leading-[1.02]">
              Beleza feita <em className="text-gold">fio a fio</em>.
            </h1>
            <p className="mt-5 max-w-md opacity-75">
              Studio de tranças onde cada penteado nasce da sua história, das nossas raízes e de muito carinho.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/agendar" className="btn-gold">Agendar horário</Link>
              <Link to="/galeria" className="btn-ghost">Ver portfólio</Link>
            </div>
          </div>
          <div className="relative mx-auto w-[85%] md:w-full">
            <div className="polaroid rotate-3 relative tape">
              <img src={hero} width={1024} height={1280} alt="Cliente com tranças no Delica Deza" className="aspect-[4/5] w-full object-cover" />
              <p className="script absolute bottom-2 left-0 right-0 text-center text-2xl text-foreground">nossa cliente ♡</p>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-full bg-gold text-ink w-24 h-24 flex flex-col items-center justify-center text-center -rotate-12 shadow-soft">
              <span className="font-display text-2xl leading-none">+500</span>
              <span className="text-[10px] uppercase tracking-wider">clientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="wood text-secondary-foreground overflow-hidden py-3 border-y-4 border-ink">
        <div className="marquee flex w-max gap-8 font-display italic text-xl whitespace-nowrap">
          {[...STYLES, ...STYLES].map((s, i) => (
            <span key={i} className="flex items-center gap-8">{s}<span className="text-accent">✦</span></span>
          ))}
        </div>
      </div>

      {/* SOBRE A PROFISSIONAL */}
      <section className="mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div className="relative mx-auto w-[80%] md:w-full">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full border-2 border-secondary" />
          <div className="relative aspect-[3/4] rounded-t-full bg-primary grain flex flex-col items-center justify-center text-primary-foreground">
            <Camera size={40} className="text-accent" />
            <p className="script text-2xl mt-2">foto da profissional</p>
          </div>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-secondary">A trancista</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Prazer, eu sou a <em className="text-primary">Deza</em>.</h2>
          <p className="script text-2xl text-secondary mt-2">e as suas tranças são a minha arte</p>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Comecei trançando a família e as amigas no quintal de casa. Hoje, no Delica Deza, transformo essa herança em
            um espaço acolhedor, rústico e cheio de identidade, onde você relaxa enquanto a gente cria.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-secondary/30 pt-6">
            {[["8+", "anos trançando"], ["12", "estilos"], ["5★", "avaliações"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl text-secondary">{n}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section className="bg-ink text-ink-foreground grain">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="script text-3xl text-accent">portfólio</p>
              <h2 className="text-4xl md:text-5xl">Trabalhos selecionados</h2>
            </div>
            <Link to="/galeria" className="hidden md:inline-flex btn-ghost">Ver tudo <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {WORKS.map((w, i) => (
              <figure key={w.n} className={i === 1 ? "md:mt-12" : ""}>
                <div className="overflow-hidden rounded-xl">
                  <img src={w.src} loading="lazy" alt={w.t} className="aspect-[4/5] w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <figcaption className="mt-3 flex items-baseline gap-3 border-b border-ink-foreground/20 pb-3">
                  <span className="font-display text-accent">{w.n}</span>
                  <span className="flex-1">{w.t}</span>
                  <span className="text-xs uppercase tracking-wider opacity-60">{w.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <Link to="/galeria" className="md:hidden btn-ghost mt-8 w-full">Ver portfólio completo</Link>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="wood text-secondary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="rounded-3xl bg-ink/85 p-8 md:p-12 max-w-2xl mx-auto">
            <p className="script text-3xl text-accent text-center">cardápio</p>
            <h2 className="text-4xl text-center">Serviços</h2>
            <ul className="mt-8 space-y-4">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-baseline gap-2">
                  <span>{s.name}</span>
                  <span className="flex-1 border-b border-dotted border-accent/50" />
                  <span className="text-accent font-display">{brl(s.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center"><Link to="/servicos" className="btn-gold">Tabela completa</Link></div>
          </div>
        </div>
      </section>

      {/* ATALHOS */}
      <section className="mx-auto max-w-6xl px-5 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: "/agendar", icon: CalendarHeart, t: "Agendar", d: "Veja dias livres" },
          { to: "/pix", icon: QrCode, t: "Pix", d: "Gere seu código" },
          { to: "/produtos", icon: Sparkles, t: "Produtos", d: "Cuide em casa" },
          { to: "/feedback", icon: MessageSquareHeart, t: "Feedback", d: "Conte como foi" },
        ].map((c, i) => (
          <Link key={c.to} to={c.to} className={`rounded-2xl bg-card border-2 border-secondary/20 p-5 hover:shadow-soft transition-all hover:-translate-y-1 ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
            <c.icon className="text-primary" />
            <p className="mt-4 font-display text-xl">{c.t}</p>
            <p className="text-sm text-muted-foreground">{c.d}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
