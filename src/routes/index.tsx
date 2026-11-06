import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Gem, HeartHandshake, Leaf, Camera, ArrowRight, Star, CalendarHeart, QrCode, Check } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import interior from "@/assets/interior.jpg";
import twist from "@/assets/twist.jpg";
import nago from "@/assets/nago.jpg";
import { meta } from "@/components/SiteShell";
import { brl } from "@/lib/salon";

export const Route = createFileRoute("/")({
  head: () => meta("Delica Deza — Salão de Tranças e Beleza", "Box braids, knotless, fulani e nagô. Agende online, pague com Pix e conheça nossos trabalhos."),
  component: Index,
});

const TRUST = [
  { icon: Award, t: "Trancistas experientes" },
  { icon: Gem, t: "Fibras premium" },
  { icon: Leaf, t: "Cuidado com o couro" },
  { icon: HeartHandshake, t: "Atendimento acolhedor" },
];
const CARDS = [
  { img: g1, t: "Box Braids", d: "Clássicas, versáteis e duradouras.", p: 280 },
  { img: hero, t: "Knotless", d: "Leves, sem nó e mais naturais.", p: 350 },
  { img: g2, t: "Fulani", d: "Nagô + soltas com miçangas.", p: 260 },
  { img: nago, t: "Tranças Nagô", d: "Desenhos geométricos exclusivos.", p: 150 },
  { img: twist, t: "Twists", d: "Passion e senegalese twist.", p: 300 },
];
const REVIEWS = [
  { n: "Camila S.", t: "Atendimento impecável, saí me sentindo uma rainha. As tranças duraram dois meses!" },
  { n: "Jéssica M.", t: "O espaço é lindo e aconchegante. Pontualidade e capricho em cada detalhe." },
  { n: "Ana Beatriz", t: "Melhor knotless que já fiz. Leve, natural e sem dor nenhuma." },
];
const STATS = [["8+", "anos de experiência"], ["500+", "clientes felizes"], ["12", "estilos de trança"], ["5.0", "avaliação média"]];

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-xs text-accent">
      <span className="h-px w-8 bg-gold" />{children}<span className="h-px w-8 bg-gold" />
    </p>
  );
}

function Index() {
  return (
    <div className="bg-ink text-ink-foreground">
      {/* HERO full-bleed */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <img src={hero} width={1024} height={1280} alt="Cliente com tranças no Delica Deza" className="absolute inset-0 h-full w-full object-cover object-[60%_20%]" />
        <div className="absolute inset-0 hero-veil" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-32">
          <p className="script text-3xl text-accent">studio de tranças</p>
          <h1 className="mt-2 text-5xl md:text-7xl leading-[1.02] max-w-2xl">
            Sua coroa,<br />trançada com <em className="text-gold">arte</em>.
          </h1>
          <p className="mt-5 max-w-md opacity-80">Tranças afro com técnica, carinho e identidade, num espaço rústico feito para você relaxar.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/agendar" className="btn-gold"><CalendarHeart size={18} /> Agendar horário</Link>
            <Link to="/servicos" className="btn-ghost">Ver serviços</Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="flex -space-x-3">
              {[g1, g2, twist].map((s, i) => <img key={i} src={s} alt="" className="h-9 w-9 rounded-full object-cover border-2 border-accent" />)}
            </div>
            <div>
              <div className="flex text-accent">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-accent" />)}</div>
              <p className="opacity-70">+500 clientes satisfeitas</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-primary grain">
        <div className="mx-auto max-w-6xl px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          {TRUST.map((x) => (
            <div key={x.t} className="flex items-center gap-3 text-primary-foreground">
              <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full border border-accent/60 text-accent"><x.icon size={18} /></span>
              <span className="text-sm leading-tight">{x.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVIÇOS cards */}
      <section className="gold-lines">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Eyebrow>nossos serviços</Eyebrow>
          <h2 className="mt-3 text-center text-4xl md:text-5xl">Tranças & cuidados</h2>
          <div className="mt-10 -mx-5 px-5 flex md:grid md:grid-cols-5 gap-4 overflow-x-auto snap-x pb-2">
            {CARDS.map((c) => (
              <Link key={c.t} to="/servicos" className="group snap-start shrink-0 w-[62%] md:w-auto rounded-2xl border border-accent/25 bg-ink overflow-hidden">
                <div className="overflow-hidden aspect-[4/5]">
                  <img src={c.img} loading="lazy" alt={c.t} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-4">
                  <p className="font-display text-xl">{c.t}</p>
                  <p className="text-xs opacity-60 mt-1">{c.d}</p>
                  <p className="mt-3 text-sm text-accent flex items-center justify-between">a partir de {brl(c.p)} <ArrowRight size={14} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE / PROFISSIONAL */}
      <section className="bg-background text-foreground grain">
        <div className="mx-auto max-w-6xl px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative mx-auto w-[80%] md:w-[85%]">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-full border-2 border-accent" />
            <div className="relative aspect-[3/4] rounded-t-full bg-primary grain flex flex-col items-center justify-center text-primary-foreground">
              <Camera size={40} className="text-accent" />
              <p className="script text-2xl mt-2">foto da profissional</p>// ADICIONAR A FOTO 
            </div>
            <div className="absolute -bottom-5 -right-2 rounded-2xl bg-ink text-ink-foreground px-5 py-3 shadow-soft">
              <p className="script text-2xl text-accent leading-none">Deza</p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">fundadora & trancista</p>
            </div>
          </div>
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-secondary">sobre nós</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Onde a tradição encontra a <em className="text-primary">delicadeza</em>.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Comecei trançando a família no quintal de casa. Hoje o Delica Deza transforma essa herança em um espaço
              acolhedor, rústico e cheio de identidade.
            </p>
            <ul className="mt-6 space-y-2">
              {["Atendimento individual e sem pressa", "Fibras de qualidade e acabamento impecável", "Orientação de manutenção pós-trança"].map((t) => (
                <li key={t} className="flex gap-2 items-center"><Check size={16} className="text-primary" />{t}</li>
              ))}
            </ul>
            <Link to="/galeria" className="btn-gold mt-8">Conheça o portfólio <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="wood border-y-4 border-ink">
        <div className="mx-auto max-w-6xl px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-secondary-foreground">
          {STATS.map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-4xl text-gold">{n}</p>
              <p className="text-xs uppercase tracking-wider opacity-80 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ESPAÇO */}
      <section className="relative overflow-hidden">
        <img src={interior} loading="lazy" width={1280} height={832} alt="Interior do salão Delica Deza" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 side-veil" />
        <div className="relative mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-md">
            <p className="script text-3xl text-accent">nosso espaço</p>
            <h2 className="text-4xl md:text-5xl">Um refúgio rústico para você</h2>
            <p className="mt-4 opacity-80">Madeira, verde e luz dourada. Traga seu fone, sua playlist, e relaxe enquanto criamos.</p>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="gold-lines">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Eyebrow>amor das clientes</Eyebrow>
          <h2 className="mt-3 text-center text-4xl md:text-5xl">O que dizem sobre nós</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {REVIEWS.map((r) => (
              <figure key={r.n} className="rounded-2xl border border-accent/25 bg-ink p-6">
                <div className="flex text-accent">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-accent" />)}</div>
                <blockquote className="mt-4 font-display italic text-lg leading-snug">“{r.t}”</blockquote>
                <figcaption className="mt-4 text-sm text-accent">— {r.n}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center"><Link to="/feedback" className="btn-ghost">Deixe seu feedback</Link></div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-primary grain p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-accent/40">
          <div>
            <p className="script text-3xl text-accent">pronta para a sua coroa?</p>
            <h2 className="text-3xl md:text-4xl text-primary-foreground">Garanta seu horário com sinal via Pix</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/agendar" className="btn-gold"><CalendarHeart size={18} /> Agendar</Link>
            <Link to="/pix" className="btn-ghost text-primary-foreground"><QrCode size={18} /> Pix</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
