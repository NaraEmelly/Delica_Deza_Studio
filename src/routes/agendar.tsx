import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { meta, PageHead } from "@/components/SiteShell";
import { HOURS, OPEN_DAYS, SERVICES, brl, waLink } from "@/lib/salon";
import { buildBookingMessage } from "@/lib/booking-message";

export const Route = createFileRoute("/agendar")({
  validateSearch: (q: Record<string, unknown>): { s?: string } => (typeof q["s"] === "string" ? { s: q["s"] } : {}),
  head: () => meta("Agendar horário — Delica Deza", "Preencha seus dados, escolha o serviço e envie seu pedido de agendamento ao Delica Deza."),
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

function Page() {
  const { s } = Route.useSearch();
  const [service, setService] = useState<string>(s ?? SERVICES[0]!.id);
  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [day, setDay] = useState<Date | null>(null);
  const [hour, setHour] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [socialName, setSocialName] = useState("");
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = useMemo(() => {
    const first = month.getDay();
    const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array(first).fill(null),
      ...Array.from({ length: total }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
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
    setFormError("");
    setSendStatus("");
    setPreparedMessage("");

    if (!day || !hour) {
      setFormError("Escolha um dia e um horário para continuar.");
      return;
    }

    const message = buildBookingMessage({
      service: selectedService.name,
      servicePrice: brl(selectedService.price),
      serviceDuration: selectedService.time,
      date: day.toLocaleDateString("pt-BR"),
      time: hour,
      name: name.trim(),
      socialName: socialName.trim(),
      gender,
      hadRecentChemical: hadRecentChemical === "yes",
      lastChemical: hadRecentChemical === "yes" ? lastChemical : "",
      braidedBefore: braidedBefore === "yes",
      hairType,
      paymentMethod,
      inspirationPhotoNames: inspirationPhotos.map((file) => file.name),
      personalPhotoName: personalPhoto?.name ?? "",
    });
    const files = [...inspirationPhotos, ...(personalPhoto ? [personalPhoto] : [])];

    if (files.length > 0) {
      try {
        if (typeof navigator.share === "function" && navigator.canShare?.({ files })) {
          await navigator.share({
            title: "Pedido de agendamento — Delica Deza",
            text: message,
            files,
          });
          setSendStatus("Compartilhamento concluído. Confira se as fotos e a ficha foram enviadas pelo WhatsApp.");
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setSendStatus("Compartilhamento cancelado. Suas fotos continuam selecionadas.");
          return;
        }
        console.error("Não foi possível compartilhar as fotos do agendamento.", error);
        setPreparedMessage(message);
        setSendStatus("Não foi possível compartilhar as fotos automaticamente. Abra o WhatsApp abaixo e anexe-as à conversa.");
        return;
      }

      setPreparedMessage(message);
      setSendStatus("Este aparelho não permite anexar fotos pelo compartilhamento. Abra o WhatsApp abaixo e anexe as fotos selecionadas antes de enviar.");
      return;
    }

    setPreparedMessage(message);
    setSendStatus("Sua ficha está pronta. Abra o WhatsApp para conferir e enviar.");
  }

  return (
    <>
      <PageHead kicker="Agendamento" title="Vamos marcar seu horário?">
        Preencha a ficha para que a profissional conheça suas preferências e possa preparar seu atendimento.
      </PageHead>
      <form
        onSubmit={handleSubmit}
        onChange={clearPreparedSend}
        className="mx-auto max-w-3xl space-y-8 px-5 py-10"
      >
        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="appointment-title">
          <div>
            <h2 id="appointment-title" className="font-display text-2xl">1. Seu atendimento</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha o serviço, o dia e o horário desejados.</p>
          </div>

          <label className="block">
            <span className="mb-1 block font-medium">Serviço</span>
            <select className="field" value={service} onChange={(event) => setService(event.target.value)}>
              {SERVICES.map((item) => (
                <option key={item.id} value={item.id}>{item.name} — a partir de {brl(item.price)}</option>
              ))}
            </select>
            <span className="mt-1 block text-sm text-muted-foreground">
              Duração aproximada: {selectedService.time}. O valor final pode variar conforme o cabelo.
            </span>
          </label>

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
                  disabled={month.getFullYear() === today.getFullYear() && month.getMonth() <= today.getMonth()}
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
                  <span key={index} className="py-1 text-muted-foreground">{weekday}</span>
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

        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="personal-title">
          <div>
            <h2 id="personal-title" className="font-display text-2xl">2. Sobre você</h2>
            <p className="mt-1 text-sm text-muted-foreground">Essas informações ajudam a equipe a preparar seu atendimento.</p>
          </div>

          <label className="block">
            <span className="mb-1 block font-medium">Qual é o seu nome?</span>
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">Nome social <span className="font-normal text-muted-foreground">(opcional)</span></span>
            <input className="field" value={socialName} onChange={(event) => setSocialName(event.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1 block font-medium">Como você se identifica?</span>
            <select className="field" value={gender} onChange={(event) => setGender(event.target.value)} required>
              <option value="">Selecione uma opção</option>
              <option>Mulher</option>
              <option>Homem</option>
              <option>Não binário</option>
              <option>Prefiro não informar</option>
            </select>
          </label>
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="hair-title">
          <div>
            <h2 id="hair-title" className="font-display text-2xl">3. Sobre seu cabelo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Conte um pouco sobre seu cabelo e seu histórico de cuidados.</p>
          </div>

          <fieldset>
            <legend className="mb-2 font-medium">Você fez algum procedimento químico recentemente?</legend>
            <p className="mb-2 text-sm text-muted-foreground">Ex.: coloração, descoloração, relaxamento ou progressiva.</p>
            <div className="flex flex-wrap gap-4">
              {[["yes", "Sim"], ["no", "Não"]].map(([value, label]) => (
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
              <span className="mb-1 block font-medium">Quando foi seu último procedimento químico?</span>
              <select className="field" value={lastChemical} onChange={(event) => setLastChemical(event.target.value)} required>
                <option value="">Selecione o período</option>
                {CHEMICAL_TIMES.map((period) => <option key={period}>{period}</option>)}
              </select>
            </label>
          )}

          <fieldset>
            <legend className="mb-2 font-medium">Você já colocou tranças alguma vez?</legend>
            <div className="flex flex-wrap gap-4">
              {[["yes", "Sim"], ["no", "Não"]].map(([value, label]) => (
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
            <select className="field" value={hairType} onChange={(event) => setHairType(event.target.value)} required>
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

        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="payment-title">
          <div>
            <h2 id="payment-title" className="font-display text-2xl">4. Pagamento</h2>
            <p className="mt-1 text-sm text-muted-foreground">Como você prefere pagar?</p>
          </div>
          <label className="block">
            <span className="mb-1 block font-medium">Forma de pagamento</span>
            <select className="field" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} required>
              <option value="">Selecione uma opção</option>
              <option>Dinheiro</option>
              <option>Pix</option>
              <option>Cartão de débito</option>
              <option>Cartão de crédito</option>
            </select>
          </label>
        </section>

        <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-7" aria-labelledby="photos-title">
          <div>
            <h2 id="photos-title" className="font-display text-2xl">5. Fotos para o atendimento</h2>
            <p className="mt-1 text-sm text-muted-foreground">As fotos são opcionais. Se puder, envie imagens de referência do modelo que você gostaria.</p>
          </div>

          <label className="block">
            <span className="mb-1 block font-medium">Fotos dos modelos de tranças <span className="font-normal text-muted-foreground">(opcional)</span></span>
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
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{file.name}</span>
                  <button
                    type="button"
                    className="rounded p-1"
                    aria-label={`Remover foto ${file.name}`}
                    onClick={() => setInspirationPhotos((photos) => photos.filter((_, photoIndex) => photoIndex !== index))}
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label className="block">
            <span className="mb-1 block font-medium">Uma foto do seu cabelo <span className="font-normal text-muted-foreground">(opcional)</span></span>
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(event) => setPersonalPhoto(event.target.files?.[0] ?? null)}
            />
            <span className="mt-1 block text-sm text-muted-foreground">A foto ajuda a profissional a entender o comprimento e o volume.</span>
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
          {formError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">{formError}</p>}
          {sendStatus && <p role="status" className="rounded-lg border bg-card p-3 text-sm">{sendStatus}</p>}
          {preparedMessage && (
            <a href={waLink(preparedMessage)} target="_blank" rel="noreferrer" className="btn-gold w-full">
              Abrir WhatsApp e enviar ficha
            </a>
          )}
          <button type="submit" className="btn-gold w-full">
            {inspirationPhotos.length > 0 || personalPhoto ? "Preparar ficha e compartilhar fotos" : "Preparar ficha para o WhatsApp"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Você poderá revisar a mensagem e confirmar o envio no WhatsApp. O agendamento será confirmado pela profissional.
          </p>
        </div>
      </form>
    </>
  );
}
