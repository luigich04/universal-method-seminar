import { NextResponse } from "next/server";
import { getSupabaseClient, getAllBookingsLocal, saveBookingAsync } from "@/lib/db";

export async function GET() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  let isConnected = false;
  let recordCount = 0;
  let errorNotice = "";

  if (!supabaseUrl) {
    errorNotice = "SUPABASE_URL non configurata nelle Environment Variables di Vercel.";
  } else if (!supabaseKey) {
    errorNotice = "SUPABASE_ANON_KEY / SERVICE_ROLE_KEY non configurata nelle Environment Variables di Vercel.";
  } else {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        const { data, error } = await sb.from("bookings").select("id", { count: "exact" });
        if (error) {
          errorNotice = `Errore Supabase Cloud: ${error.message}`;
        } else {
          isConnected = true;
          recordCount = data ? data.length : 0;
        }
      } else {
        errorNotice = "Impossibile inizializzare il client Supabase.";
      }
    } catch (err: any) {
      errorNotice = `Eccezione di connessione: ${err.message}`;
    }
  }

  const localBookings = getAllBookingsLocal();

  return NextResponse.json({
    supabaseUrl: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/)?([^/]+).*/, "$2") : "MANCANTE",
    isConnected,
    recordCount,
    localRecordCount: localBookings.length,
    errorNotice,
    activeProvider: isConnected ? "Supabase Cloud DB" : "Local File / Fallback",
  });
}

export async function POST() {
  try {
    const sb = getSupabaseClient();
    if (!sb) {
      return NextResponse.json(
        { error: "Supabase non connesso. Verificare le variabili di ambiente su Vercel." },
        { status: 400 }
      );
    }

    const localBookings = getAllBookingsLocal();
    let syncedCount = 0;

    for (const record of localBookings) {
      await saveBookingAsync(record);
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Sincronizzati con successo ${syncedCount} record su Supabase Cloud DB.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
