import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import { meta, PageHead } from "@/components/SiteShell";

export const Route = createFileRoute("/galeria")({
  head: () => meta("Galeria de clientes — Delica Deza", "Fotos das nossas clientes e trabalhos de tranças feitos no Delica Deza."),
  component: Page,
});

const BASE = [
  { src: hero, label: "Box braids longas" },
  { src: g1, label: "Tranças com anéis dourados" },
  { src: g2, label: "Fulani com miçangas" },
];

function Page() {
  const [photos, setPhotos] = useState(BASE);
  const [view, setView] = useState<string | null>(null);

  const add = (files: FileList | null) => {
    if (!files) return;
    const extra = Array.from(files).map((f) => ({ src: URL.createObjectURL(f), label: f.name }));
    setPhotos((p) => [...extra, ...p]);
  };

  return (
    <>
      <PageHead kicker="Portfólio" title="Galeria das clientes">Cada cliente, uma história. Toque para ampliar.</PageHead>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <label className="btn-gold cursor-pointer mb-8">
          <ImagePlus size={18} /> Adicionar fotos
          <input type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
        </label>
        <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
          {photos.map((p, i) => (
            <button key={i} onClick={() => setView(p.src)} className="block w-full overflow-hidden rounded-2xl">
              <img src={p.src} alt={p.label} loading="lazy" className="w-full hover:scale-105 transition-transform duration-500" />
            </button>
          ))}
        </div>
      </section>
      {view && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <button className="absolute top-4 right-4 text-ink-foreground" aria-label="Fechar"><X /></button>
          <img src={view} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </>
  );
}
