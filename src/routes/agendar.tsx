import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import hero from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import nago from "@/assets/nago.jpg";
import twist from "@/assets/twist.jpg";
import { meta, PageHead } from "@/components/SiteShell";
import { HOURS, OPEN_DAYS, SERVICES, waLink } from "@/lib/salon";
import { buildBookingMessage } from "@/lib/booking-message";
import { isSupabaseConfigured, recordBookingAccess, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/agendar")({
  validateSearch: (q: Record<string, unknown>): { s?: string } =>
    typeof q["s"] === "string" ? { s: q["s"] } : {},
  head: () =>
    meta(
      "Agendar horário — Delica Deza",
      "Preencha seus dados, escolha o serviço e envie seu pedido de agendamento ao Delica Deza.",
    ),
  component: Page,
});

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const CHEMICAL_TIMES = [
  "Há menos de 1 mês",
  "De 1 a 3 meses",
  "De 3 a 6 meses",
  "De 6 meses a 1 ano",
  "Há mais de 1 ano",
  "Não lembro",
];

const SERVICE_IMAGES: Record<string, { src: string; alt: string }> = {
  knotles: { src: hero, alt: "Tranças Knotles longas" },
  entrelace: { src: g1, alt: "Tranças longas, referência para entrelace" },
  nago: { src: nago, alt: "Tranças Nagô" },
  "nago-desenhada": { src: nago, alt: "Tranças Nagô com desenhos geométricos" },
  "nago-topo": { src: nago, alt: "Tranças Nagô no topo da cabeça" },
  "fulani-organico": { src: g2, alt: "Tranças Fulani com miçangas" },
  "bon-braids": { src: twist, alt: "Tranças longas, referência para Bon Braids" },
};

const FIBER_COLORS = [
  { name: "1 — Preto", color: "#171717" },
  { name: "1B — Preto natural", color: "#30251f" },
  { name: "2 — Castanho escuro", color: "#51372c" },
  { name: "4 — Castanho médio", color: "#79513b" },
  { name: "27 — Loiro mel", color: "#c99148" },
  { name: "30 — Acobreado", color: "#984d2e" },
  { name: "350 — Ruivo", color: "#b43b24" },
  { name: "613 — Loiro claro", color: "#e5d19c" },
  { name: "Borgonha", color: "#6d1838" },
  { name: "Cinza", color: "#858585" },
];

function Page() {
  const { s } = Route.useSearch();
  const [service, setService] = useState<string>(s ?? SERVICES[0]!.id);
  const [fiberColorChoice, setFiberColorChoice] = useState("");
  const [fiberColors, setFiberColors] = useState<string[]>([]);
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [socialName, setSocialName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [hadRecentChemical, setHadRecentChemical] = useState("");
  const [lastChemical, setLastChemical] = useState("");
  const [braidedBefore, setBraidedBefore] = useState("");
  const [hairType, setHairType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [inspirationPhotos, setInspirationPhotos] = useState<File[]>([]);
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [preparedMessage, setPreparedMessage] = useState("");
  const [trackingError, setTrackingError] = useState("");

  useEffect(() => {
    let active = true;
    void recordBookingAccess("form_visit").then((error) => {
      if (active && error) setTrackingError(error);
    });
    return () => {
      active = false;
    };
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = useMemo(() => {
    const first = month.getDay();
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array(first).fill(null),
      ...Array.from(
        { length: total },
        (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
      ),
    ];
  }, [month]);

  const selectedService = SERVICES.find((item) => item.id === service) ?? SERVICES[0]!;

  function clearPreparedSend() {
    setFormError("");
    setSendStatus("");
    setPreparedMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError("");
    setSendStatus("");
    setPreparedMessage("");
    setTrackingError("");

    if (!day || !hour) {
      setFormError("Escolha um dia e um horário para continuar.");
      return;
    }

    if (fiberColorChoice === "colors" && fiberColors.length === 0) {
      setFormError("Escolha pelo menos uma cor de fibra ou selecione outra opção.");
      return;
    }

    const message = buildBookingMessage({
      service: selectedService.name,
      fiberColor:
        fiberColorChoice === "root"
          ? "Da mesma cor da raiz do cabelo"
          : fiberColorChoice === "colors"
            ? fiberColors.join(", ")
            : fiberColorChoice === "talk"
              ? "Prefere conversar com a profissional"
              : "Não informado",
      date: day.toLocaleDateString("pt-BR"),
      time: hour,
      name: name.trim(),
      socialName: socialName.trim(),
      phone: phone.trim(),
      gender,
      hadRecentChemical: hadRecentChemical === "yes",
      lastChemical: hadRecentChemical === "yes" ? lastChemical : "",
      braidedBefore: braidedBefore === "yes",
      hairType,
      paymentMethod,
      inspirationPhotoNames: inspirationPhotos.map((file) => file.name),
      personalPhotoName: personalPhoto?.name ?? "",
    });
    const requestedDate = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const requestedTime = hour;
    setPreparedMessage(message);
    const whatsappWindow = window.open("about:blank", "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    setSendStatus("Registrando o pedido e preparando o WhatsApp...");

    const errors: string[] = [];
    if (!supabase) {
      errors.push("Supabase não configurado: este pedido não será salvo no painel.");
    } else {
      try {
        const accessError = await recordBookingAccess("submission");
        if (accessError) errors.push(accessError);

        const formData = new FormData(form);
        const { error: bookingError } = await supabase.rpc("create_booking_request", {
          p_service_name: selectedService.name,
          p_fiber_color:
            fiberColorChoice === "root"
              ? "Da mesma cor da raiz do cabelo"
              : fiberColorChoice === "colors"
                ? fiberColors.join(", ")
                : fiberColorChoice === "talk"
                  ? "Prefere conversar com a profissional"
                  : "Não informado",
          p_requested_for: requestedDate,
          p_requested_time: requestedTime,
          p_client_name: name.trim(),
          p_social_name: socialName.trim(),
          p_client_phone: phone.trim(),
          p_gender: gender,
          p_had_recent_chemical: hadRecentChemical === "yes",
          p_last_chemical: hadRecentChemical === "yes" ? lastChemical : "",
          p_braided_before: braidedBefore === "yes",
          p_hair_type: hairType,
          p_payment_method: paymentMethod,
          p_inspiration_photo_names: inspirationPhotos.map((file) => file.name),
          p_personal_photo_name: personalPhoto?.name ?? "",
          p_consent: formData.get("data-consent") === "on",
        });
        if (bookingError) {
          console.error("Não foi possível salvar o pedido de agendamento.", bookingError);
          errors.push("O pedido não foi salvo no painel.");
        }
      } catch (error) {
        console.error("Falha ao integrar o agendamento com o Supabase.", error);
        errors.push("Não foi possível comunicar com o Supabase; o pedido não foi salvo no painel.");
      }
    }

    if (whatsappWindow) {
      whatsappWindow.location.href = waLink(message);
      setSendStatus(
        `O WhatsApp foi aberto com sua ficha para o contato da profissional. Revise e toque em Enviar para confirmar o pedido.${
          errors.length ? ` Atenção: ${errors.join(" ")}` : ""
        }`,
      );
    } else {
      setSendStatus(
        `O navegador bloqueou a abertura automática. Use o botão abaixo para abrir o WhatsApp e enviar sua ficha.${
          errors.length ? ` Atenção: ${errors.join(" ")}` : ""
        }`,
      );
    }
  }

  return (
    <>
      <PageHead kicker="Agendamento" title="Vamos marcar seu horário?">
        Preencha a ficha para que a profissional conheça suas preferências e possa preparar seu
        atendimento.
      </PageHead>
      <form
        onSubmit={handleSubmit}
        onChange={clearPreparedSend}
        className="mx-auto max-w-3xl space-y-8 px-5 py-10"
      >
        <section
          className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
          aria-labelledby="appointment-title"
        >
          <div>
            <h2 id="appointment-title" className="font-display text-2xl">
              1. Seu atendimento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha o serviço, o dia e o horário desejados.
            </p>
          </div>

          <fieldset>
            <legend className="mb-3 font-medium">Escolha o serviço</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((item) => {
                const image = SERVICE_IMAGES[item.id]!;
                const selected = service === item.id;
                return (
                  <label
                    key={item.id}
                    className={`cursor-pointer overflow-hidden rounded-xl border transition-colors focus-within:ring-2 focus-within:ring-ring ${selected ? "border-primary ring-2 ring-primary/30" : "bg-background hover:border-primary/50"}`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={item.id}
                      checked={selected}
                      onChange={() => {
                        clearPreparedSend();
                        setService(item.id);
                      }}
                      required
                      className="sr-only"
                    />
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <span className="flex items-start justify-between gap-3 p-3">
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Consulte valores e detalhes pelo WhatsApp.
                        </span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              A profissional informará o valor pelo WhatsApp.
            </p>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-medium">Qual cor de fibra você prefere?</legend>
            <p className="mb-3 text-sm text-muted-foreground">
              Você pode escolher uma ou mais cores para combinar.
            </p>
            <div className="space-y-2">
              {[
                ["root", "Da mesma cor da raiz do meu cabelo"],
                ["colors", "Quero escolher a cor da fibra"],
                ["talk", "Prefiro decidir com a profissional"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fiber-color-choice"
                    value={value}
                    checked={fiberColorChoice === value}
                    onChange={(event) => setFiberColorChoice(event.target.value)}
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
            {fiberColorChoice === "colors" && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FIBER_COLORS.map((fiberColor) => {
                  const checked = fiberColors.includes(fiberColor.name);
                  return (
                    <label
                      key={fiberColor.name}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${checked ? "border-primary bg-primary/10" : "bg-background"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          setFiberColors((current) =>
                            event.target.checked
                              ? [...current, fiberColor.name]
                              : current.filter((color) => color !== fiberColor.name),
                          );
                        }}
                      />
                      <span
                        className="size-5 shrink-0 rounded-full border"
                        style={{ backgroundColor: fiberColor.color }}
                        aria-hidden="true"
                      />
                      {fiberColor.name}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-medium">Dia</legend>
            <div className="rounded-2xl border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    clearPreparedSend();
                    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
                  }}
                  disabled={
                    month.getFullYear() === today.getFullYear() &&
                    month.getMonth() <= today.getMonth()
                  }
                  aria-label="Mês anterior"
                  className="rounded-full p-2 disabled:opacity-40"
                >
                  <ChevronLeft />
                </button>
                <p className="font-medium capitalize">
                  {month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearPreparedSend();
                    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
                  }}
                  aria-label="Próximo mês"
                  className="rounded-full p-2"
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {WEEK.map((weekday, index) => (
                  <span key={index} className="py-1 text-muted-foreground">
                    {weekday}
                  </span>
                ))}
                {days.map((date, index) => {
                  if (!date) return <span key={index} />;
                  const available = date >= today && OPEN_DAYS.includes(date.getDay());
                  const selected = day?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        clearPreparedSend();
                        setDay(date);
                        setHour(null);
                      }}
                      aria-pressed={selected}
                      aria-label={date.toLocaleDateString("pt-BR", { dateStyle: "full" })}
                      className={`aspect-square rounded-full ${selected ? "bg-gold font-semibold text-ink" : available ? "text-foreground hover:bg-muted" : "text-muted-foreground/40 line-through"}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          {day && (
            <fieldset>
              <legend className="mb-3 font-medium">Horário</legend>
              <div className="flex flex-wrap gap-2">
                {HOURS.map((availableHour) => (
                  <button
                    key={availableHour}
                    type="button"
                    onClick={() => {
                      clearPreparedSend();
                      setHour(availableHour);
                    }}
                    aria-pressed={hour === availableHour}
                    className={`rounded-full border px-4 py-2 ${hour === availableHour ? "border-secondary bg-secondary text-secondary-foreground" : "bg-background"}`}
                  >
                    {availableHour}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </section>

        <section
          className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
          aria-labelledby="personal-title"
        >
          <div>
            <h2 id="personal-title" className="font-display text-2xl">
              2. Sobre você
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Essas informações ajudam a equipe a preparar seu atendimento.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block font-medium">Qual é o seu nome?</span>
            <input
              className="field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">Seu WhatsApp para contato</span>
            <input
              className="field"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              minLength={8}
              maxLength={40}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">
              Nome social <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <input
              className="field"
              value={socialName}
              onChange={(event) => setSocialName(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">Como você se identifica?</span>
            <select
              className="field"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              required
            >
              <option value="">Selecione uma opção</option>
              <option>Mulher</option>
              <option>Homem</option>
              <option>Não binário</option>
              <option>Prefiro não informar</option>
            </select>
          </label>
        </section>

        <section
          className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
          aria-labelledby="hair-title"
        >
          <div>
            <h2 id="hair-title" className="font-display text-2xl">
              3. Sobre seu cabelo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Conte um pouco sobre seu cabelo e seu histórico de cuidados.
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 font-medium">
              Você fez algum procedimento químico recentemente?
            </legend>
            <p className="mb-2 text-sm text-muted-foreground">
              Ex.: coloração, descoloração, relaxamento ou progressiva.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                ["yes", "Sim"],
                ["no", "Não"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recent-chemical"
                    value={value}
                    checked={hadRecentChemical === value}
                    onChange={(event) => setHadRecentChemical(event.target.value)}
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {hadRecentChemical === "yes" && (
            <label className="block">
              <span className="mb-1 block font-medium">
                Quando foi seu último procedimento químico?
              </span>
              <select
                className="field"
                value={lastChemical}
                onChange={(event) => setLastChemical(event.target.value)}
                required
              >
                <option value="">Selecione o período</option>
                {CHEMICAL_TIMES.map((period) => (
                  <option key={period}>{period}</option>
                ))}
              </select>
            </label>
          )}

          <fieldset>
            <legend className="mb-2 font-medium">Você já colocou tranças alguma vez?</legend>
            <div className="flex flex-wrap gap-4">
              {[
                ["yes", "Sim"],
                ["no", "Não"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="braided-before"
                    value={value}
                    checked={braidedBefore === value}
                    onChange={(event) => setBraidedBefore(event.target.value)}
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block font-medium">Qual é a curvatura do seu cabelo?</span>
            <select
              className="field"
              value={hairType}
              onChange={(event) => setHairType(event.target.value)}
              required
            >
              <option value="">Selecione a curvatura</option>
              <optgroup label="Tipo 1 — Liso">
                <option>1A — Liso</option>
                <option>1B — Liso</option>
                <option>1C — Liso</option>
              </optgroup>
              <optgroup label="Tipo 2 — Ondulado">
                <option>2A — Ondulado</option>
                <option>2B — Ondulado</option>
                <option>2C — Ondulado</option>
              </optgroup>
              <optgroup label="Tipo 3 — Cacheado">
                <option>3A — Cacheado</option>
                <option>3B — Cacheado</option>
                <option>3C — Cacheado</option>
              </optgroup>
              <optgroup label="Tipo 4 — Crespo">
                <option>4A — Crespo</option>
                <option>4B — Crespo</option>
                <option>4C — Crespo</option>
              </optgroup>
              <option>Não sei identificar</option>
            </select>
          </label>
        </section>

        <section
          className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
          aria-labelledby="payment-title"
        >
          <div>
            <h2 id="payment-title" className="font-display text-2xl">
              4. Pagamento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Como você prefere pagar?</p>
          </div>
          <label className="block">
            <span className="mb-1 block font-medium">Forma de pagamento</span>
            <select
              className="field"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              required
            >
              <option value="">Selecione uma opção</option>
              <option>Dinheiro</option>
              <option>Cartão de débito</option>
              <option>Cartão de crédito</option>
            </select>
          </label>
        </section>

        <section
          className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7"
          aria-labelledby="photos-title"
        >
          <div>
            <h2 id="photos-title" className="font-display text-2xl">
              5. Fotos para o atendimento
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              As fotos são opcionais. Se puder, envie imagens de referência do modelo que você
              gostaria.
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block font-medium">
              Fotos dos modelos de tranças{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <input
              className="field"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setInspirationPhotos(Array.from(event.target.files ?? []))}
            />
          </label>
          {inspirationPhotos.length > 0 && (
            <ul className="space-y-2" aria-label="Fotos de referência selecionadas">
              {inspirationPhotos.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <span className="min-w-0 truncate">{file.name}</span>
                  <button
                    type="button"
                    className="rounded p-1"
                    aria-label={`Remover foto ${file.name}`}
                    onClick={() =>
                      setInspirationPhotos((photos) =>
                        photos.filter((_, photoIndex) => photoIndex !== index),
                      )
                    }
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label className="block">
            <span className="mb-1 block font-medium">
              Uma foto do seu cabelo{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(event) => setPersonalPhoto(event.target.files?.[0] ?? null)}
            />
            <span className="mt-1 block text-sm text-muted-foreground">
              A foto ajuda a profissional a entender o comprimento e o volume.
            </span>
          </label>
          {personalPhoto && (
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
              <span className="min-w-0 truncate">{personalPhoto.name}</span>
              <button
                type="button"
                className="rounded p-1"
                aria-label={`Remover foto ${personalPhoto.name}`}
                onClick={() => setPersonalPhoto(null)}
              >
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        <div className="space-y-3">
          {formError && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">
              {formError}
            </p>
          )}
          {sendStatus && (
            <p role="status" className="rounded-lg border bg-card p-3 text-sm">
              {sendStatus}
            </p>
          )}
          {(!isSupabaseConfigured || trackingError) && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {trackingError ||
                "O banco ainda não está conectado. Os pedidos continuarão abrindo no WhatsApp, mas não aparecerão no painel profissional."}
            </p>
          )}
          {preparedMessage && (
            <a
              href={waLink(preparedMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold w-full"
            >
              Abrir WhatsApp caso não tenha aberto
            </a>
          )}
          <button type="submit" className="btn-gold w-full">
            Enviar pedido de agendamento
          </button>
          <label className="flex items-start gap-3 text-sm">
            <input className="mt-1" type="checkbox" name="data-consent" required />
            <span>
              Autorizo o uso destes dados pela profissional para organizar meu agendamento e
              preparar o atendimento. Meus dados não serão exibidos publicamente.
            </span>
          </label>
          <p className="text-center text-xs text-muted-foreground">
            O WhatsApp será aberto com a ficha preenchida para você confirmar o envio. Se selecionou
            fotos, anexe-as na conversa. O agendamento será confirmado pela profissional.
          </p>
        </div>
      </form>
    </>
  );
}
