import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Download, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { brl } from "@/lib/salon";
import {
  isSupabaseConfigured,
  supabase,
  type Booking,
  type Service,
  type ServiceFinance,
  type StaffProfile,
} from "@/lib/supabase";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel profissional — Delica Deza" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfessionalPanel,
});

type Section = "overview" | "bookings" | "clients" | "access" | "team";
type BookingStatus = Booking["status"];

const SECTION_LABELS: Record<Section, string> = {
  overview: "Resumo",
  bookings: "Agendamentos",
  clients: "Clientes",
  access: "Acessos",
  team: "Serviços e financeiro",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const inputClass = "field";
const cardClass = "rounded-2xl border bg-card p-5 sm:p-6";

function ProfessionalPanel() {
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [finances, setFinances] = useState<ServiceFinance[]>([]);
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [accessEvents, setAccessEvents] = useState<
    { id: number; event_type: "form_visit" | "submission"; created_at: string }[]
  >([]);
  const [accessCounts, setAccessCounts] = useState({ visits: 0, submissions: 0 });
  const [editingServiceId, setEditingServiceId] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const client = supabase;
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setFormError(`Não foi possível verificar a sessão: ${error.message}`);
        }
        setSession(data.session);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFormError(
          error instanceof Error ? error.message : "Não foi possível verificar a sessão.",
        );
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(null);
      setFormError("");
      setNotice("");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setProfile(null);
      return;
    }

    let active = true;
    const client = supabase;
    setIsLoading(true);
    void client
      .from("staff_profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(
        ({ data, error }) => {
          if (!active) return;
          if (error) {
            setFormError(`Não foi possível carregar as permissões da conta: ${error.message}`);
          } else if (!data) {
            setFormError("Esta conta não tem um perfil autorizado para acessar o painel.");
          } else {
            setProfile(data);
            setFormError("");
          }
          setIsLoading(false);
        },
        (error: unknown) => {
          if (!active) return;
          setFormError(
            error instanceof Error ? error.message : "Não foi possível carregar o perfil.",
          );
          setIsLoading(false);
        },
      );

    return () => {
      active = false;
    };
  }, [session]);

  async function loadPanelData() {
    if (!supabase || !profile) return;
    setIsLoading(true);
    setFormError("");
    const client = supabase;

    try {
      const servicesResult = await client.from("services").select("*").order("name");
      if (servicesResult.error) throw servicesResult.error;
      setServices(servicesResult.data ?? []);

      const allFinances: ServiceFinance[] = [];
      let financeOffset = 0;
      while (true) {
        const financeResult = await client
          .from("service_finances")
          .select("*")
          .order("created_at", { ascending: false })
          .range(financeOffset, financeOffset + 999);
        if (financeResult.error) throw financeResult.error;
        const page = financeResult.data ?? [];
        allFinances.push(...page);
        if (page.length < 1000) break;
        financeOffset += 1000;
      }
      setFinances(allFinances);

      if (profile.role === "owner") {
        const [eventResult, profileResult, visitCount, submissionCount] = await Promise.all([
          client
            .from("booking_access_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500),
          client.from("staff_profiles").select("*").order("full_name"),
          client
            .from("booking_access_events")
            .select("id", { count: "exact", head: true })
            .eq("event_type", "form_visit"),
          client
            .from("booking_access_events")
            .select("id", { count: "exact", head: true })
            .eq("event_type", "submission"),
        ]);
        if (eventResult.error) throw eventResult.error;
        if (profileResult.error) throw profileResult.error;
        if (visitCount.error) throw visitCount.error;
        if (submissionCount.error) throw submissionCount.error;

        const allBookings: Booking[] = [];
        let bookingOffset = 0;
        while (true) {
          const bookingResult = await client
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false })
            .range(bookingOffset, bookingOffset + 999);
          if (bookingResult.error) throw bookingResult.error;
          const page = bookingResult.data ?? [];
          allBookings.push(...page);
          if (page.length < 1000) break;
          bookingOffset += 1000;
        }

        setBookings(allBookings);
        setAccessEvents(eventResult.data ?? []);
        setProfiles(profileResult.data ?? []);
        setAccessCounts({ visits: visitCount.count ?? 0, submissions: submissionCount.count ?? 0 });
      } else {
        setBookings([]);
        setAccessEvents([]);
        setProfiles([]);
        setAccessCounts({ visits: 0, submissions: 0 });
      }
    } catch (error) {
      console.error("Não foi possível carregar os dados do painel.", error);
      setFormError(
        `Não foi possível carregar os dados. Confira a instalação do SQL e as permissões RLS. ${
          error instanceof Error ? error.message : ""
        }`,
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (profile) void loadPanelData();
    // Data refresh is triggered when the authenticated profile changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const clients = useMemo(() => {
    const grouped = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const key = booking.client_phone.replace(/\D/g, "") || booking.client_name.toLowerCase();
      grouped.set(key, [...(grouped.get(key) ?? []), booking]);
    }
    return [...grouped.values()].map((history) => ({
      name: history[0]?.client_name ?? "",
      phone: history[0]?.client_phone ?? "",
      history,
      latest: history[0]?.created_at ?? "",
    }));
  }, [bookings]);

  const isOwner = profile?.role === "owner";
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const visits = accessCounts.visits;
  const submissions = accessCounts.submissions;
  const totalRevenue = finances.reduce((sum, item) => sum + Number(item.service_amount), 0);
  const helperShare = finances.reduce((sum, item) => sum + Number(item.helper_amount), 0);

  function isBookingStatus(value: string): value is BookingStatus {
    return Object.hasOwn(STATUS_LABELS, value);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setFormError("");
    setNotice("");
    setIsSaving(true);
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setFormError(`Não foi possível entrar: ${error.message}`);
    setIsSaving(false);
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setFormError(`Não foi possível encerrar a sessão: ${error.message}`);
  }

  async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    if (!supabase || !isOwner) return;
    setFormError("");
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) {
      setFormError(`Não foi possível atualizar o agendamento: ${error.message}`);
      return;
    }
    setBookings((current) =>
      current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)),
    );
    setNotice("Situação do agendamento atualizada.");
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !isOwner) return;
    const form = event.currentTarget;
    setFormError("");
    setNotice("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const serviceId = String(formData.get("service_id") ?? "");
    const serviceInput = {
      name: String(formData.get("name") ?? "").trim(),
      base_price: Number(formData.get("base_price") ?? 0),
      helper_amount: Number(formData.get("helper_amount") ?? 0),
      helper_id: String(formData.get("helper_id") ?? "") || null,
      active: formData.get("active") === "on",
    };
    const result = serviceId
      ? await supabase.from("services").update(serviceInput).eq("id", serviceId)
      : await supabase.from("services").insert(serviceInput);
    setIsSaving(false);
    if (result.error) {
      setFormError(`Não foi possível salvar o serviço: ${result.error.message}`);
      return;
    }
    form.reset();
    setEditingServiceId("");
    setNotice("Serviço e valores salvos.");
    await loadPanelData();
  }

  async function addFinanceEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !isOwner) return;
    setFormError("");
    setNotice("");
    setIsSaving(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const serviceId = String(formData.get("service_id") ?? "");
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
      setFormError("Selecione um serviço válido.");
      setIsSaving(false);
      return;
    }
    const result = await supabase.from("service_finances").insert({
      booking_id: String(formData.get("booking_id") ?? "") || null,
      service_id: service.id,
      helper_id: service.helper_id,
      service_name: service.name,
      service_amount: Number(formData.get("service_amount") ?? 0),
      helper_amount: Number(formData.get("helper_amount") ?? 0),
      payment_method: String(formData.get("payment_method") ?? ""),
      paid: formData.get("paid") === "on",
      notes: String(formData.get("notes") ?? "").trim(),
    });
    setIsSaving(false);
    if (result.error) {
      setFormError(`Não foi possível registrar o lançamento financeiro: ${result.error.message}`);
      return;
    }
    form.reset();
    setNotice("Lançamento financeiro registrado.");
    await loadPanelData();
  }

  async function toggleFinancePaid(entry: ServiceFinance) {
    if (!supabase || !isOwner) return;
    const { error } = await supabase
      .from("service_finances")
      .update({ paid: !entry.paid })
      .eq("id", entry.id);
    if (error) {
      setFormError(`Não foi possível atualizar o pagamento: ${error.message}`);
      return;
    }
    setFinances((current) =>
      current.map((item) => (item.id === entry.id ? { ...item, paid: !entry.paid } : item)),
    );
  }

  function exportReport() {
    const rows = [
      ["Cliente", "WhatsApp", "Serviço", "Data desejada", "Horário", "Status", "Enviado em"],
      ...bookings.map((booking) => [
        booking.client_name,
        booking.client_phone,
        booking.service_name,
        booking.requested_for,
        booking.requested_time,
        STATUS_LABELS[booking.status],
        new Date(booking.created_at).toLocaleString("pt-BR"),
      ]),
    ];
    downloadCsv("relatorio-agendamentos-delica-deza.csv", rows);
  }

  function exportFinanceReport() {
    const rows = [
      [
        "Serviço",
        "Valor recebido",
        "Valor do ajudante",
        "Pagamento",
        "Repasse pago",
        "Observações",
        "Data",
      ],
      ...finances.map((entry) => [
        entry.service_name,
        Number(entry.service_amount).toFixed(2),
        Number(entry.helper_amount).toFixed(2),
        entry.payment_method,
        entry.paid ? "Sim" : "Não",
        entry.notes,
        new Date(entry.created_at).toLocaleString("pt-BR"),
      ]),
    ];
    downloadCsv("relatorio-financeiro-delica-deza.csv", rows);
  }

  async function exportAccessReport() {
    if (!supabase || !isOwner) return;
    setFormError("");
    setNotice("");
    setIsSaving(true);
    const events: { event_type: string; created_at: string }[] = [];
    let start = 0;
    try {
      while (true) {
        const result = await supabase
          .from("booking_access_events")
          .select("event_type, created_at")
          .order("created_at", { ascending: true })
          .range(start, start + 999);
        if (result.error) throw result.error;
        events.push(...(result.data ?? []));
        if ((result.data ?? []).length < 1000) break;
        start += 1000;
      }
      downloadCsv("relatorio-acessos-agendamento-delica-deza.csv", [
        ["Tipo de acesso", "Data e hora"],
        ...events.map((event) => [
          event.event_type === "form_visit" ? "Visita ao formulário" : "Pedido enviado",
          new Date(event.created_at).toLocaleString("pt-BR"),
        ]),
      ]);
      setNotice(`Relatório exportado com ${events.length} eventos.`);
    } catch (error) {
      console.error("Não foi possível exportar todos os acessos.", error);
      setFormError(
        `Não foi possível exportar o relatório completo de acessos. ${
          error instanceof Error ? error.message : ""
        }`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  function downloadCsv(filename: string, rows: (string | number)[][]) {
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <PanelFrame>
        <PanelHeading kicker="Configuração necessária" title="Conecte seu Supabase">
          O painel precisa das variáveis públicas do seu projeto Supabase. Nenhuma chave secreta
          deve ser colocada no navegador.
        </PanelHeading>
        <div className={`${cardClass} mt-8`}>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>Execute o script SQL de instalação no SQL Editor do seu projeto Supabase.</li>
            <li>
              Copie <code>.env.example</code> para <code>.env.local</code> e preencha URL e chave
              publicável do projeto.
            </li>
            <li>Crie o usuário do profissional e promova-o a proprietário conforme o SQL.</li>
          </ol>
          <p className="mt-5 text-sm text-muted-foreground">
            A chave service_role não deve ser usada aqui nem compartilhada.
          </p>
        </div>
      </PanelFrame>
    );
  }

  if (isLoading && !session) {
    return (
      <PanelFrame>
        <p role="status" className="mx-auto max-w-xl px-5 py-16 text-center">
          Verificando sessão...
        </p>
      </PanelFrame>
    );
  }

  if (!session) {
    return (
      <PanelFrame>
        <PanelHeading kicker="Área restrita" title="Acesso profissional">
          Entre com a conta criada no Supabase. O cadastro de novas contas não é público.
        </PanelHeading>
        <form onSubmit={signIn} className={`${cardClass} mx-auto mt-8 max-w-md space-y-4`}>
          <label className="block space-y-2 text-sm font-medium">
            E-mail
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Senha
            <input
              className={inputClass}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {formError && (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          )}
          <button className="btn-gold w-full" type="submit" disabled={isSaving}>
            {isSaving ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </PanelFrame>
    );
  }

  if (isLoading && !profile) {
    return (
      <PanelFrame>
        <p role="status" className="mx-auto max-w-xl px-5 py-16 text-center">
          Carregando permissões...
        </p>
      </PanelFrame>
    );
  }

  if (!profile) {
    return (
      <PanelFrame>
        <PanelHeading kicker="Acesso não autorizado" title="Perfil não encontrado">
          Esta conta não possui um perfil autorizado. Peça ao proprietário do salão para verificar o
          cadastro no Supabase.
        </PanelHeading>
        <div className="mx-auto mt-6 max-w-xl">
          {formError && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              {formError}
            </p>
          )}
          <button type="button" className="btn-ghost" onClick={() => void signOut()}>
            Sair
          </button>
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent" />
            <div>
              <p className="font-semibold">Painel Delica Deza</p>
              <p className="text-xs opacity-70">
                {profile.full_name || session.user.email} · {isOwner ? "Profissional" : "Ajudante"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost !py-2 !px-3"
              onClick={() => void loadPanelData()}
            >
              <RefreshCw size={16} /> Atualizar
            </button>
            <button type="button" className="btn-ghost !py-2 !px-3" onClick={() => void signOut()}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Seções do painel">
          {(isOwner
            ? (Object.keys(SECTION_LABELS) as Section[])
            : (["overview", "team"] as Section[])
          ).map((section) => (
            <button
              key={section}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm ${
                activeSection === section ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
              onClick={() => setActiveSection(section)}
            >
              {SECTION_LABELS[section]}
            </button>
          ))}
        </nav>

        {formError && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-4 rounded-lg border bg-card p-3 text-sm">
            {notice}
          </p>
        )}
        {isLoading && (
          <p role="status" className="mb-4 text-sm">
            Atualizando informações...
          </p>
        )}

        {activeSection === "overview" && (
          <section aria-labelledby="overview-title">
            <h1 id="overview-title" className="mb-5 text-3xl">
              Resumo
            </h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label={isOwner ? "Pedidos pendentes" : "Serviços atribuídos"}
                value={isOwner ? pendingBookings : services.length}
              />
              {isOwner && <Metric label="Clientes cadastradas" value={clients.length} />}
              {isOwner && <Metric label="Acessos ao formulário" value={visits} />}
              {isOwner && <Metric label="Pedidos recebidos" value={submissions} />}
              <Metric label="Faturamento registrado" value={brl(totalRevenue)} />
              <Metric label="Repasse ao ajudante" value={brl(helperShare)} />
              {isOwner && <Metric label="Atendimentos concluídos" value={completedBookings} />}
            </div>
            {isOwner && (
              <div className={`${cardClass} mt-5`}>
                <h2 className="text-xl">Pedidos recentes</h2>
                <div className="mt-4 divide-y">
                  {bookings.slice(0, 5).map((booking) => (
                    <BookingSummary key={booking.id} booking={booking} />
                  ))}
                  {bookings.length === 0 && (
                    <p className="py-4 text-sm text-muted-foreground">
                      Nenhum agendamento recebido ainda.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === "bookings" && isOwner && (
          <section aria-labelledby="bookings-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 id="bookings-title" className="text-3xl">
                Controle de agendamentos
              </h1>
              <button type="button" className="btn-ghost !py-2" onClick={exportReport}>
                <Download size={16} /> Exportar relatório CSV
              </button>
            </div>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article key={booking.id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl">{booking.client_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {booking.client_phone} · {booking.service_name} ·{" "}
                        {new Date(`${booking.requested_for}T00:00:00`).toLocaleDateString("pt-BR")}{" "}
                        às {booking.requested_time}
                      </p>
                    </div>
                    <label className="text-sm">
                      Situação
                      <select
                        className="field mt-1 min-w-40"
                        value={booking.status}
                        onChange={(event) => {
                          const status = event.target.value;
                          if (isBookingStatus(status)) void updateBookingStatus(booking.id, status);
                        }}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <details className="mt-4 border-t pt-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Ficha detalhada da cliente
                    </summary>
                    <BookingDetails booking={booking} />
                  </details>
                </article>
              ))}
              {bookings.length === 0 && (
                <EmptyState>Os pedidos enviados pelo formulário aparecerão aqui.</EmptyState>
              )}
            </div>
          </section>
        )}

        {activeSection === "clients" && isOwner && (
          <section aria-labelledby="clients-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 id="clients-title" className="text-3xl">
                Relatórios de clientes
              </h1>
              <button type="button" className="btn-ghost !py-2" onClick={exportReport}>
                <Download size={16} /> Exportar clientes e pedidos
              </button>
            </div>
            <div className="space-y-4">
              {clients.map((client) => (
                <article key={client.phone || client.name} className={cardClass}>
                  <h2 className="text-xl">{client.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {client.phone} · {client.history.length} agendamento(s) · último pedido{" "}
                    {new Date(client.latest).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="mt-4 space-y-3">
                    {client.history.map((booking) => (
                      <details key={booking.id} className="rounded-lg border p-3">
                        <summary className="cursor-pointer text-sm">
                          {booking.service_name} ·{" "}
                          {new Date(`${booking.requested_for}T00:00:00`).toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          · {STATUS_LABELS[booking.status]}
                        </summary>
                        <BookingDetails booking={booking} />
                      </details>
                    ))}
                  </div>
                </article>
              ))}
              {clients.length === 0 && (
                <EmptyState>Os relatórios serão gerados a partir dos pedidos recebidos.</EmptyState>
              )}
            </div>
          </section>
        )}

        {activeSection === "access" && isOwner && (
          <section aria-labelledby="access-title">
            <h1 id="access-title" className="mb-5 text-3xl">
              Acessos ao agendamento
            </h1>
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric label="Visitas ao formulário" value={visits} />
              <Metric label="Pedidos enviados" value={submissions} />
            </div>
            <p className="my-4 text-sm text-muted-foreground">
              O registro não coleta IP nem identifica visitantes; são contabilizadas as visitas e os
              envios. A lista abaixo mostra os 500 eventos mais recentes.
            </p>
            <button
              type="button"
              className="btn-ghost mb-4 !py-2"
              onClick={() => void exportAccessReport()}
              disabled={isSaving}
            >
              <Download size={16} /> Exportar todos os acessos
            </button>
            <div className={`${cardClass} divide-y`}>
              {accessEvents.map((event) => (
                <div key={event.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span>
                    {event.event_type === "form_visit" ? "Visita ao formulário" : "Pedido enviado"}
                  </span>
                  <time dateTime={event.created_at}>
                    {new Date(event.created_at).toLocaleString("pt-BR")}
                  </time>
                </div>
              ))}
              {accessEvents.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">
                  Nenhum acesso registrado ainda.
                </p>
              )}
            </div>
          </section>
        )}

        {activeSection === "team" && (
          <section aria-labelledby="team-title">
            <h1 id="team-title" className="mb-5 text-3xl">
              {isOwner ? "Serviços e controle financeiro" : "Meus serviços e valores"}
            </h1>
            {isOwner && (
              <>
                <form
                  key={editingServiceId || "new-service"}
                  onSubmit={saveService}
                  className={`${cardClass} mb-5 grid gap-4 sm:grid-cols-2`}
                >
                  <h2 className="text-xl sm:col-span-2">
                    {editingServiceId
                      ? "Editar serviço e valores"
                      : "Cadastrar serviço e atribuir ajudante"}
                  </h2>
                  <input type="hidden" name="service_id" value={editingServiceId} readOnly />
                  <label className="space-y-2 text-sm font-medium">
                    Nome do serviço
                    <input
                      className={inputClass}
                      name="name"
                      defaultValue={services.find((item) => item.id === editingServiceId)?.name}
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Ajudante responsável
                    <select
                      className={inputClass}
                      name="helper_id"
                      defaultValue={
                        services.find((item) => item.id === editingServiceId)?.helper_id ?? ""
                      }
                    >
                      <option value="">Sem ajudante atribuído</option>
                      {profiles
                        .filter((item) => item.role === "helper")
                        .map((helper) => (
                          <option key={helper.id} value={helper.id}>
                            {helper.full_name || helper.id}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Valor do serviço (R$)
                    <input
                      className={inputClass}
                      name="base_price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={
                        services.find((item) => item.id === editingServiceId)?.base_price ?? 0
                      }
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Valor destinado ao ajudante (R$)
                    <input
                      className={inputClass}
                      name="helper_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={
                        services.find((item) => item.id === editingServiceId)?.helper_amount ?? 0
                      }
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={
                        services.find((item) => item.id === editingServiceId)?.active ?? true
                      }
                    />{" "}
                    Serviço ativo
                  </label>
                  <button className="btn-gold sm:col-span-2" type="submit" disabled={isSaving}>
                    {editingServiceId ? "Salvar alterações" : "Salvar serviço"}
                  </button>
                  {editingServiceId && (
                    <button
                      className="btn-ghost sm:col-span-2"
                      type="button"
                      onClick={() => setEditingServiceId("")}
                    >
                      Cancelar edição
                    </button>
                  )}
                </form>
                <form
                  onSubmit={addFinanceEntry}
                  className={`${cardClass} mb-5 grid gap-4 sm:grid-cols-2`}
                >
                  <h2 className="text-xl sm:col-span-2">Registrar recebimento e repasse</h2>
                  <label className="space-y-2 text-sm font-medium">
                    Serviço
                    <select
                      className={inputClass}
                      name="service_id"
                      required
                      onChange={(event) => {
                        const service = services.find((item) => item.id === event.target.value);
                        const form = event.currentTarget.form;
                        if (form && service) {
                          (form.elements.namedItem("service_amount") as HTMLInputElement).value =
                            String(service.base_price);
                          (form.elements.namedItem("helper_amount") as HTMLInputElement).value =
                            String(service.helper_amount);
                        }
                      }}
                    >
                      <option value="">Selecione</option>
                      {services
                        .filter((item) => item.active)
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Agendamento relacionado (opcional)
                    <select className={inputClass} name="booking_id" defaultValue="">
                      <option value="">Sem vínculo</option>
                      {bookings.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {booking.client_name} · {booking.service_name} ·{" "}
                          {new Date(`${booking.requested_for}T00:00:00`).toLocaleDateString(
                            "pt-BR",
                          )}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Total recebido (R$)
                    <input
                      className={inputClass}
                      name="service_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Repasse ao ajudante (R$)
                    <input
                      className={inputClass}
                      name="helper_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Forma de pagamento
                    <input className={inputClass} name="payment_method" />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Observação
                    <input className={inputClass} name="notes" />
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" name="paid" /> Repasse ao ajudante já pago
                  </label>
                  <button className="btn-gold sm:col-span-2" type="submit" disabled={isSaving}>
                    Registrar lançamento
                  </button>
                </form>
              </>
            )}
            <div className="space-y-4">
              {services.map((service) => (
                <article key={service.id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">{service.name}</h2>
                      <p className="mt-2 text-sm">
                        Valor do serviço: <strong>{brl(Number(service.base_price))}</strong> · Valor
                        do ajudante: <strong>{brl(Number(service.helper_amount))}</strong> ·{" "}
                        {service.active ? "Ativo" : "Inativo"}
                      </p>
                      {isOwner && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ajudante:{" "}
                          {profiles.find((item) => item.id === service.helper_id)?.full_name ||
                            "Não atribuído"}
                        </p>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        className="btn-ghost !py-2"
                        onClick={() => setEditingServiceId(service.id)}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {services.length === 0 && (
                <EmptyState>Nenhum serviço atribuído a esta conta.</EmptyState>
              )}
            </div>
            <h2 className="mb-3 mt-8 text-2xl">Lançamentos financeiros</h2>
            <button type="button" className="btn-ghost mb-4 !py-2" onClick={exportFinanceReport}>
              <Download size={16} /> Exportar relatório financeiro
            </button>
            <div className="space-y-3">
              {finances.map((entry) => (
                <article
                  key={entry.id}
                  className={`${cardClass} flex flex-wrap items-center justify-between gap-4`}
                >
                  <div>
                    <h3 className="font-semibold">{entry.service_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Recebido {brl(Number(entry.service_amount))} · Ajudante{" "}
                      {brl(Number(entry.helper_amount))} ·{" "}
                      {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {isOwner ? (
                    <button
                      className="btn-ghost !py-2"
                      type="button"
                      onClick={() => void toggleFinancePaid(entry)}
                    >
                      {entry.paid ? "Repasse pago" : "Marcar repasse pago"}
                    </button>
                  ) : (
                    <span className="rounded-full border px-3 py-1 text-sm">
                      {entry.paid ? "Pago" : "Pendente"}
                    </span>
                  )}
                </article>
              ))}
              {finances.length === 0 && (
                <EmptyState>Nenhum lançamento financeiro registrado.</EmptyState>
              )}
            </div>
          </section>
        )}
      </div>
    </PanelFrame>
  );
}

function PanelFrame({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-background">{children}</main>;
}

function PanelHeading({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{kicker}</p>
        <h1 className="mt-3 text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl opacity-80">{children}</p>
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className={cardClass}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function BookingSummary({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-3 text-sm">
      <span>
        {booking.client_name} · {booking.service_name}
      </span>
      <span>
        {STATUS_LABELS[booking.status]} · {new Date(booking.created_at).toLocaleDateString("pt-BR")}
      </span>
    </div>
  );
}

function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
      <Detail label="WhatsApp" value={booking.client_phone} />
      <Detail label="Nome social" value={booking.social_name || "Não informado"} />
      <Detail label="Cor da fibra" value={booking.fiber_color || "Não informado"} />
      <Detail label="Identidade de gênero" value={booking.gender || "Não informado"} />
      <Detail
        label="Procedimento químico recente"
        value={booking.had_recent_chemical ? `Sim — ${booking.last_chemical}` : "Não"}
      />
      <Detail label="Já usou tranças" value={booking.braided_before ? "Sim" : "Não"} />
      <Detail label="Curvatura do cabelo" value={booking.hair_type || "Não informado"} />
      <Detail
        label="Forma preferida de pagamento"
        value={booking.payment_method || "Não informado"}
      />
      <Detail
        label="Fotos de referência"
        value={booking.inspiration_photo_names.join(", ") || "Nenhuma"}
      />
      <Detail label="Foto do cabelo" value={booking.personal_photo_name || "Não enviada"} />
      <Detail
        label="Pedido recebido em"
        value={new Date(booking.created_at).toLocaleString("pt-BR")}
      />
    </dl>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className={`${cardClass} text-sm text-muted-foreground`}>{children}</p>;
}
