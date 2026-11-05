import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Instagram, MessageCircle } from "lucide-react";
import { SALON, waLink } from "@/lib/salon";

const NAV = [
  { to: "/servicos", label: "Serviços" },
  { to: "/galeria", label: "Galeria" },
  { to: "/produtos", label: "Produtos" },
  { to: "/pix", label: "Pagar com Pix" },
  { to: "/feedback", label: "Feedback" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          <Link to="/" className="font-display text-2xl italic">
            Delica <span className="text-gold not-italic font-semibold">Deza</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="opacity-80 hover:opacity-100" activeProps={{ className: "text-accent opacity-100" }}>
                {n.label}
              </Link>
            ))}
            <Link to="/agendar" className="btn-gold !py-2">Agendar</Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="md:hidden flex flex-col gap-4 px-5 pb-6 text-lg">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <Link to="/agendar" onClick={() => setOpen(false)} className="btn-gold">Agendar horário</Link>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-5 py-12 grid gap-6 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl italic">Delica <span className="text-gold not-italic">Deza</span></p>
            <p className="mt-2 text-sm opacity-70">Tranças, cuidado e autoestima.</p>
          </div>
          <p className="text-sm opacity-80">{SALON.address}<br />Ter a Sáb · 08h às 19h</p>
          <div className="flex gap-3">
            <a className="btn-ghost !p-3" href={`https://instagram.com/${SALON.instagram}`} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a className="btn-ghost !p-3" href={waLink("Olá, Delica Deza!")} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="uppercase tracking-[0.3em] text-xs text-accent">{kicker}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{title}</h1>
        {children && <p className="mt-3 max-w-xl opacity-80">{children}</p>}
      </div>
    </section>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
