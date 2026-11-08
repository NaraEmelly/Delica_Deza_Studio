import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, Instagram, X } from "lucide-react";
import instagramPhoto1 from "@/assets/instagram-cliente-1.jpg";
import instagramPhoto2 from "@/assets/instagram-cliente-2.jpg";
import instagramPhoto3 from "@/assets/instagram-cliente-3.jpg";
import { meta, PageHead } from "@/components/SiteShell";

export const Route = createFileRoute("/galeria")({
  head: () =>
    meta(
      "Galeria de clientes — Delica Deza",
      "Fotos das nossas clientes e trabalhos de tranças feitos no Delica Deza.",
    ),
  component: Page,
});

type GalleryPhoto = { src: string; label: string; postUrl?: string };

const BASE: GalleryPhoto[] = [
  {
    src: instagramPhoto1,
    label: "Cliente com cabelos longos cacheados",
    postUrl: "https://www.instagram.com/p/DfFsXqPgdpA/",
  },
  {
    src: instagramPhoto2,
    label: "Cliente com tranças Nagô desenhadas",
    postUrl: "https://www.instagram.com/p/De-ldWokax1/",
  },
  {
    src: instagramPhoto3,
    label: "Cliente com tranças longas e cachos",
    postUrl: "https://www.instagram.com/p/De5CLnQBY9v/",
  },
];

function Page() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(BASE);
  const [view, setView] = useState<string | null>(null);

  const add = (files: FileList | null) => {
    if (!files) return;
    const extra = Array.from(files).map((f) => ({ src: URL.createObjectURL(f), label: f.name }));
    setPhotos((p) => [...extra, ...p]);
  };

  return (
    <>
      <PageHead kicker="Portfólio" title="Galeria das clientes">
        Fotos do Instagram oficial e trabalhos das clientes. Toque na imagem para ampliar.
      </PageHead>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          <label className="btn-gold cursor-pointer">
            <ImagePlus size={18} /> Adicionar fotos
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => add(e.target.files)}
            />
          </label>
          <a
            href="https://www.instagram.com/delicadeza_oficial/"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            <Instagram size={18} /> Ver Instagram oficial
          </a>
        </div>
        <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {photos.map((p, i) => (
            <figure
              key={`${p.label}-${i}`}
              className="break-inside-avoid overflow-hidden rounded-2xl"
            >
              <button onClick={() => setView(p.src)} className="block w-full">
                <img
                  src={p.src}
                  alt={p.label}
                  loading="lazy"
                  className="w-full hover:scale-105 transition-transform duration-500"
                />
              </button>
              <figcaption className="flex items-center justify-between gap-2 bg-card px-3 py-2 text-sm">
                <span className="truncate">{p.label}</span>
                {p.postUrl && (
                  <a
                    href={p.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 text-primary"
                    aria-label={`Ver no Instagram: ${p.label}`}
                  >
                    <Instagram size={16} /> Instagram
                  </a>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      {view && (
        <div
          className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4"
          onClick={() => setView(null)}
        >
          <button className="absolute top-4 right-4 text-ink-foreground" aria-label="Fechar">
            <X />
          </button>
          <img src={view} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </>
  );
}
