import { createClient } from "@supabase/supabase-js";

type StaffProfile = {
  id: string;
  full_name: string;
  role: "owner" | "helper";
  created_at: string;
};

type Service = {
  id: string;
  name: string;
  base_price: number;
  helper_amount: number;
  helper_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type Booking = {
  id: string;
  service_id: string | null;
  service_name: string;
  fiber_color: string;
  requested_for: string;
  requested_time: string;
  client_name: string;
  social_name: string;
  client_phone: string;
  gender: string;
  had_recent_chemical: boolean;
  last_chemical: string;
  braided_before: boolean;
  hair_type: string;
  payment_method: string;
  inspiration_photo_names: string[];
  personal_photo_name: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  consented_at: string;
  created_at: string;
};

type BookingAccessEvent = {
  id: number;
  event_type: "form_visit" | "submission";
  created_at: string;
};

type ServiceFinance = {
  id: string;
  booking_id: string | null;
  service_id: string | null;
  helper_id: string | null;
  service_name: string;
  service_amount: number;
  helper_amount: number;
  payment_method: string;
  paid: boolean;
  notes: string;
  created_at: string;
};

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Database = {
  public: {
    Tables: {
      staff_profiles: TableDefinition<
        StaffProfile,
        Pick<StaffProfile, "id"> & Partial<Pick<StaffProfile, "full_name" | "role">>
      >;
      services: TableDefinition<
        Service,
        Pick<Service, "name"> &
          Partial<Pick<Service, "base_price" | "helper_amount" | "helper_id" | "active">>
      >;
      bookings: TableDefinition<
        Booking,
        Omit<Booking, "id" | "status" | "consented_at" | "created_at"> &
          Partial<Pick<Booking, "status" | "consented_at">>
      >;
      booking_access_events: TableDefinition<
        BookingAccessEvent,
        Pick<BookingAccessEvent, "event_type">
      >;
      service_finances: TableDefinition<
        ServiceFinance,
        Pick<ServiceFinance, "service_name" | "service_amount"> &
          Partial<
            Pick<
              ServiceFinance,
              | "booking_id"
              | "service_id"
              | "helper_id"
              | "helper_amount"
              | "payment_method"
              | "paid"
              | "notes"
            >
          >
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_owner: { Args: Record<PropertyKey, never>; Returns: boolean };
      record_booking_access: {
        Args: { p_event_type: "form_visit" | "submission" };
        Returns: undefined;
      };
      create_booking_request: {
        Args: {
          p_service_name: string;
          p_fiber_color: string;
          p_requested_for: string;
          p_requested_time: string;
          p_client_name: string;
          p_social_name: string;
          p_client_phone: string;
          p_gender: string;
          p_had_recent_chemical: boolean;
          p_last_chemical: string;
          p_braided_before: boolean;
          p_hair_type: string;
          p_payment_method: string;
          p_inspiration_photo_names: string[];
          p_personal_photo_name: string;
          p_consent: boolean;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export async function recordBookingAccess(eventType: BookingAccessEvent["event_type"]) {
  if (!supabase) {
    return "Supabase ainda não está configurado neste site.";
  }

  try {
    const { error } = await supabase.rpc("record_booking_access", { p_event_type: eventType });
    if (error) {
      console.error("Não foi possível registrar o acesso ao agendamento.", error);
      return "Não foi possível registrar este acesso no banco de dados.";
    }
  } catch (error) {
    console.error("Falha ao comunicar com o Supabase para registrar o acesso.", error);
    return "Não foi possível comunicar com o banco de dados para registrar este acesso.";
  }

  return null;
}

export type { Booking, BookingAccessEvent, Service, ServiceFinance, StaffProfile };
