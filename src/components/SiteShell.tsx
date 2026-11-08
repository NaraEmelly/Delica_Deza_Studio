import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Accessibility, Menu, X, Instagram, MessageCircle, Mail, MapPin } from "lucide-react";
import { SALON, waLink } from "@/lib/salon";

const SIMPLE_MODE_STORAGE_KEY = "delica-deza-simple-mode";

const SIMPLE_PAGE_INFO: Record<string, { description: string; detailsLabel: string }> = {
  "/": {
    description: "Veja os serviços, conheça os produtos ou marque seu horário.",
    detailsLabel: "Ver mais informações do salão",
  },
  "/servicos": {
    description: "Escolha um estilo, veja fotos de referência e marque seu horário.",
    detailsLabel: "Ver serviços e referências",
  },
  "/agendar": {
    description:
      "Escolha o serviço, o dia e o horário. Depois, informe seu nome e confirme pelo WhatsApp.",
    detailsLabel: "Continuar para escolher o horário",
  },
  "/produtos": {
    description: "Escolha os produtos e as quantidades. Depois, envie seu pedido pelo WhatsApp.",
    detailsLabel: "Ver produtos e fazer pedido",
  },
  "/feedback": {
    description: "Dê uma nota, conte como foi seu atendimento e envie sua opinião pelo WhatsApp.",
    detailsLabel: "Continuar para enviar sua opinião",
  },
  "/galeria": {
    description: "Veja fotos de tranças feitas no salão.",
    detailsLabel: "Ver fotos da galeria",
  },
};

const NAV = [
  { to: "/servicos", label: "Serviços" },
  { to: "/galeria", label: "Galeria" },
  { to: "/produtos", label: "Produtos" },
  { to: "/feedback", label: "Feedback" },
] as const;

function SimpleModeButton({
  simpleMode,
  onToggle,
  className,
}: {
  simpleMode: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const label = simpleMode ? "Desativar modo simples" : "Ativar modo simples";

  return (
    <button
      type="button"
      className={`btn-ghost !py-2 !px-3 text-xs ${className ?? ""}`}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={simpleMode}
    >
      <Accessibility size={18} aria-hidden="true" />
      <span className="hidden lg:inline" aria-hidden="true">
        {simpleMode ? "Modo simples ativo" : "Modo simples"}
      </span>
    </button>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [showAccessibilityPrompt, setShowAccessibilityPrompt] = useState(false);
  const pageInfo = SIMPLE_PAGE_INFO[pathname] ?? {
    description: "Encontre as informações e os serviços do Delica Deza.",
    detailsLabel: "Ver conteúdo da página",
  };

  useEffect(() => {
    try {
      const preference = window.localStorage.getItem(SIMPLE_MODE_STORAGE_KEY);
      if (preference === "simple") {
        setSimpleMode(true);
      } else if (preference !== "standard") {
        setShowAccessibilityPrompt(true);
      }
    } catch (error) {
      console.error("Não foi possível carregar a preferência de acessibilidade.", error);
      setShowAccessibilityPrompt(true);
    }
  }, []);

  function chooseSimpleMode(enabled: boolean) {
    try {
      window.localStorage.setItem(SIMPLE_MODE_STORAGE_KEY, enabled ? "simple" : "standard");
    } catch (error) {
      console.error("Não foi possível salvar a preferência de acessibilidade.", error);
    }
    setSimpleMode(enabled);
    setShowAccessibilityPrompt(false);
  }

  function toggleSimpleMode() {
    chooseSimpleMode(!simpleMode);
  }

  return (
    <div className="min-h-screen flex flex-col grain">
      <header className="sticky top-0 z-40 bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          <Link to="/" className="font-display text-2xl italic">
            Delica <span className="text-gold not-italic font-semibold">Deza</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="opacity-80 hover:opacity-100"
                activeProps={{ className: "text-accent opacity-100" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/agendar" className="btn-gold !py-2">
              Agendar
            </Link>
            <SimpleModeButton simpleMode={simpleMode} onToggle={toggleSimpleMode} />
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <SimpleModeButton simpleMode={simpleMode} onToggle={toggleSimpleMode} />
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {showAccessibilityPrompt && (
          <section
            className="border-t border-accent/40 bg-background text-foreground"
            aria-labelledby="accessibility-prompt-title"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="accessibility-prompt-title" className="text-xl font-semibold">
                  Você gostaria de ver informações mais simples?
                </h2>
                <p className="mt-1 text-sm">
                  Mostraremos primeiro um resumo direto. Você ainda poderá abrir todos os detalhes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn-gold" onClick={() => chooseSimpleMode(true)}>
                  Sim, deixar mais simples
                </button>
                <button type="button" className="btn-ghost" onClick={() => chooseSimpleMode(false)}>
                  Não, continuar assim
                </button>
              </div>
            </div>
          </section>
        )}
        {open && (
          <nav className="md:hidden flex flex-col gap-4 px-5 pb-6 text-lg">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Link to="/agendar" onClick={() => setOpen(false)} className="btn-gold">
              Agendar horário
            </Link>
          </nav>
        )}
      </header>
      <main className="flex-1">
        {simpleMode ? (
          <section className="mx-auto max-w-6xl px-5 py-8" aria-labelledby="simple-page-title">
            <div className="rounded-2xl border border-primary/30 bg-card p-6">
              <h1 id="simple-page-title" className="text-2xl font-semibold">
                Informações principais
              </h1>
              <p className="mt-2">{pageInfo.description}</p>
              {pathname === "/" && (
                <nav className="mt-5 flex flex-wrap gap-3" aria-label="Acesso rápido">
                  <Link to="/servicos" className="btn-gold">
                    Ver serviços
                  </Link>
                  <Link to="/agendar" className="btn-ghost">
                    Marcar horário
                  </Link>
                  <Link to="/produtos" className="btn-ghost">
                    Ver produtos
                  </Link>
                </nav>
              )}
            </div>
            <details className="mt-4 rounded-2xl border border-border bg-background">
              <summary className="cursor-pointer rounded-2xl px-6 py-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                {pageInfo.detailsLabel}
              </summary>
              <div className="border-t border-border">{children}</div>
            </details>
          </section>
        ) : (
          children
        )}
      </main>
      <footer className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-5 py-12 grid gap-6 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl italic">
              Delica <span className="text-gold not-italic">Deza</span>
            </p>
            <p className="mt-2 text-sm opacity-70">Tranças, cuidado e autoestima.</p>
          </div>
          <div className="space-y-2 text-sm opacity-80">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 hover:opacity-100"
            >
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <span>{SALON.address}</span>
            </a>
            <p>Ter a Sáb · 08h às 19h</p>
          </div>
          <div className="space-y-3">
            <a
              className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100"
              href={`mailto:${SALON.email}`}
            >
              <Mail size={18} /> {SALON.email}
            </a>
            <div className="flex gap-3">
              <a
                className="btn-ghost !p-3"
                href={`https://instagram.com/${SALON.instagram}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram @${SALON.instagram}`}
              >
                <Instagram size={18} />
              </a>
              <a
                className="btn-ghost !p-3"
                href={waLink("Olá, Delica Deza!")}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
              <a
                className="text-sm opacity-80 hover:opacity-100 self-center"
                href={`https://instagram.com/${SALON.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                @{SALON.instagram}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-primary text-primary-foreground grain">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="uppercase tracking-[0.3em] text-xs text-accent">{kicker}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{title}</h1>
        <div className="mt-4 h-px w-24 bg-gold" />
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
