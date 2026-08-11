"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./admin.module.css";
import TicketBarcode from "@/components/TicketBarcode";
import TicketPassCodes from "@/components/TicketPassCodes";
import ScannerModal from "./ScannerModal";

// ── SVG Icon Components ──
const IconCreditCard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    <path d="M13 5v14" strokeDasharray="2 2" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconRefresh = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconPrint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconWhatsApp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevron = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ""}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface BookingRecord {
  id: string;
  ticketId: string;
  stripeSessionId?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  martialSystem: string;
  experienceLevel: string;
  tierKey: string;
  tierName: string;
  amountPaid: number;
  currency: string;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED" | "CANCELLED";
  paymentMethod: string;
  attended: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CRMStats {
  totalRevenue: number;
  totalPaidCount: number;
  maxCapacity: number;
  spotsLeft: number;
  fullPassCount: number;
  day1Count: number;
  day2Count: number;
}

interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "warning";
}

export default function AdminCRMPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [stats, setStats] = useState<CRMStats>({
    totalRevenue: 0,
    totalPaidCount: 0,
    maxCapacity: 30,
    spotsLeft: 30,
    fullPassCount: 0,
    day1Count: 0,
    day2Count: 0,
  });

  // Collapsible States
  const [isKpiOpen, setIsKpiOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [modalPanels, setModalPanels] = useState({
    contact: true,
    seminar: true,
    notes: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Selection
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Manual Add Form State
  const [newBooking, setNewBooking] = useState({
    fullName: "",
    email: "",
    phone: "",
    martialSystem: "BJJ (Brazilian Jiu-Jitsu)",
    experienceLevel: "Intermedio",
    tierKey: "full",
    paymentMethod: "cash",
    paymentStatus: "PAID" as const,
    notes: "",
  });

  const addToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching CRM data:", err);
      addToast("Errore nel caricamento dati CRM", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleLiveRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    addToast("Dati sincronizzati con Supabase Cloud");
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setIsKpiOpen(false);
      setIsFiltersOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === "ums2026" || pin.trim() === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("PIN errato. Prova con: ums2026");
    }
  };

  const handleUpdatePaymentStatus = async (
    ticketId: string,
    newStatus: "PAID" | "PENDING" | "REFUNDED" | "CANCELLED"
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.ticketId === ticketId ? { ...b, paymentStatus: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.ticketId === ticketId) {
      setSelectedBooking((prev) => (prev ? { ...prev, paymentStatus: newStatus } : null));
    }

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action: "update_status",
          paymentStatus: newStatus,
        }),
      });
      if (res.ok) {
        addToast(`Stato pagamento aggiornato a ${newStatus} per ${ticketId}`);
        fetchBookings();
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      addToast("Errore durante l'aggiornamento dello stato", "warning");
    }
  };

  const handleToggleAttendance = async (ticketId: string, currentAttended: boolean) => {
    const newAttended = !currentAttended;
    setBookings((prev) =>
      prev.map((b) => (b.ticketId === ticketId ? { ...b, attended: newAttended } : b))
    );
    if (selectedBooking && selectedBooking.ticketId === ticketId) {
      setSelectedBooking((prev) => (prev ? { ...prev, attended: newAttended } : null));
    }

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action: "toggle_attendance",
          attended: newAttended,
        }),
      });
      if (res.ok) {
        addToast(newAttended ? `Check-in effettuato per ${ticketId}` : `Presenza rimossa per ${ticketId}`);
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      addToast("Errore aggiornamento presenza", "warning");
    }
  };

  const handleUpdateNotes = async (ticketId: string, notes: string) => {
    try {
      await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action: "update_notes",
          notes,
        }),
      });
      setBookings((prev) => prev.map((b) => (b.ticketId === ticketId ? { ...b, notes } : b)));
      addToast("Nota salvata nel CRM");
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  const handleDeleteBooking = async (ticketId: string) => {
    if (!confirm(`Sicuro di voler eliminare la prenotazione ${ticketId}?`)) return;
    try {
      const res = await fetch(`/api/admin/bookings?ticketId=${ticketId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.ticketId !== ticketId));
        if (selectedBooking?.ticketId === ticketId) setSelectedBooking(null);
        fetchBookings();
        addToast(`Prenotazione ${ticketId} eliminata`);
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleAddManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.fullName || !newBooking.email) {
      alert("Nome e Email sono obbligatori");
      return;
    }

    const tierName =
      newBooking.tierKey === "full"
        ? "FULL SEMINAR (2 DAYS)"
        : newBooking.tierKey === "day1"
        ? "DAY 1 PASS — PERCEIVE"
        : "DAY 2 PASS — ADAPT";

    const amountPaid = newBooking.tierKey === "full" ? 140 : 80;

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBooking,
          tierName,
          amountPaid,
          currency: "EUR",
          attended: false,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewBooking({
          fullName: "",
          email: "",
          phone: "",
          martialSystem: "BJJ (Brazilian Jiu-Jitsu)",
          experienceLevel: "Intermedio",
          tierKey: "full",
          paymentMethod: "cash",
          paymentStatus: "PAID",
          notes: "",
        });
        fetchBookings();
        addToast("Nuova iscrizione manuale registrata con successo!");
      }
    } catch (err) {
      console.error("Error adding booking:", err);
      addToast("Errore durante il salvataggio dell'iscrizione", "warning");
    }
  };

  const handleCopyEmails = () => {
    const emails = filteredBookings.map((b) => b.email).filter(Boolean);
    if (emails.length === 0) {
      addToast("Nessuna email da copiare", "warning");
      return;
    }
    navigator.clipboard.writeText(emails.join(", "));
    addToast(`${emails.length} indirizzi email copiati negli appunti!`);
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    const headers = [
      "Ticket ID",
      "Nome Partecipante",
      "Email",
      "Telefono",
      "Sistema Marziale",
      "Livello",
      "Tipo Pass",
      "Importo EUR",
      "Stato Pagamento",
      "Metodo",
      "Presenza",
      "Note Interne",
      "Data Iscrizione",
    ];

    const rows = filteredBookings.map((b) => [
      b.ticketId,
      `"${b.fullName}"`,
      b.email,
      b.phone,
      `"${b.martialSystem}"`,
      `"${b.experienceLevel}"`,
      `"${b.tierName}"`,
      b.amountPaid,
      b.paymentStatus,
      b.paymentMethod,
      b.attended ? "PRESENTE" : "ASSENTE",
      `"${(b.notes || "").replace(/"/g, '""')}"`,
      new Date(b.createdAt).toLocaleDateString("it-IT"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UMS_Roster_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Export CSV scaricato con successo!");
  };

  const handlePrintRoster = () => {
    window.print();
  };

  // Filter and Sort Logic
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchesSearch =
          b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.phone.includes(searchQuery) ||
          (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTier = tierFilter === "all" || b.tierKey === tierFilter;
        const matchesStatus = statusFilter === "all" || b.paymentStatus === statusFilter;
        const matchesAttendance =
          attendanceFilter === "all" ||
          (attendanceFilter === "attended" && b.attended) ||
          (attendanceFilter === "absent" && !b.attended);

        return matchesSearch && matchesTier && matchesStatus && matchesAttendance;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
        if (sortBy === "amount") return b.amountPaid - a.amountPaid;
        return 0;
      });
  }, [bookings, searchQuery, tierFilter, statusFilter, attendanceFilter, sortBy]);

  const attendedCount = useMemo(() => bookings.filter((b) => b.attended).length, [bookings]);
  const capacityPercent = Math.min(100, Math.round((stats.totalPaidCount / stats.maxCapacity) * 100));

  // Login Overlay Screen
  if (!isAuthenticated) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loginCard}>
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
            <IconShield />
          </div>
          <p className={styles.brandSub}>UNIVERSAL METHOD SEMINAR</p>
          <h2 className={styles.loginTitle}>COMMAND CENTER</h2>
          <p style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "8px" }}>
            Inserisci il PIN di accesso amministrativo per accedere al CRM
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              className={styles.pinInput}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />

            <button
              type="submit"
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              style={{ width: "100%", justifyContent: "center", height: "46px", fontSize: "13px" }}
            >
              AUTENTICA ACCESSO ➔
            </button>
          </form>

          <p style={{ fontSize: "12px", color: "#71717a", marginTop: "20px" }}>
            PIN Predefinito: <code style={{ color: "#e1a10b" }}>ums2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Background Watermark */}
      <div className={styles.watermarkContainer}>
        <img src="/logo-yim.png" alt="" className={styles.watermarkImg} />
      </div>

      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <IconCheck />
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Top Command Header */}
      <header className={styles.adminHeader}>
        <div className={styles.brandGroup}>
          <div className={styles.brandTitleGroup}>
            <h1 className={styles.brandTitle}>CRM SEMINARIO UMS</h1>
            <span className={styles.beaconDot} title="Supabase Cloud Active" />
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.actionBtn}
            onClick={handleLiveRefresh}
            disabled={isRefreshing}
            title="Sincronizza con Supabase Cloud DB"
          >
            <IconRefresh />
            {isRefreshing ? "AGGIORNAMENTO..." : "AGGIORNA"}
          </button>

          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => setShowAddModal(true)}
          >
            <IconPlus />
            NUOVA PRENOTAZIONE
          </button>

          <button
            className={styles.actionBtn}
            onClick={() => setShowScannerModal(true)}
            title="Apri scanner fotocamera / lettore laser USB per verificare biglietti"
          >
            <IconTarget />
            SCANNER PASS
          </button>

          <button className={styles.actionBtn} onClick={handleCopyEmails} title="Copia lista email negli appunti">
            <IconCopy />
            COPIA EMAIL
          </button>

          <button className={styles.actionBtn} onClick={handleExportCSV} title="Scarica report CSV">
            <IconDownload />
            EXPORT CSV
          </button>

          <button className={styles.actionBtn} onClick={handlePrintRoster} title="Stampa registro check-in">
            <IconPrint />
            STAMPA
          </button>

          <button className={styles.logoutBtn} onClick={() => setIsAuthenticated(false)}>
            ESCI
          </button>
        </div>
      </header>

      {/* Collapsible KPI Section */}
      <div className={styles.sectionToggleHeader} onClick={() => setIsKpiOpen(!isKpiOpen)}>
        <div className={styles.sectionTitleGroup}>
          <span>PANNELLO KPI & STATISTICHE</span>
        </div>
        <IconChevron isOpen={isKpiOpen} />
      </div>

      {isKpiOpen && (
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardAccent}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>INCASSO CONFERMATO</span>
              <span className={styles.kpiIcon}><IconCreditCard /></span>
            </div>
            <div className={`${styles.kpiValue} ${styles.kpiValueHighlight}`}>
              €{stats.totalRevenue}.00
            </div>
            <p className={styles.kpiSub}>Transazioni saldate tramite Stripe & Diretto</p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>CAPIENZA POSTI ISCRITTI</span>
              <span className={styles.kpiIcon}><IconTarget /></span>
            </div>
            <div className={styles.kpiValue}>
              {stats.totalPaidCount} <span style={{ fontSize: "18px", color: "#71717a", fontWeight: 400 }}>/ {stats.maxCapacity}</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressBarFill} style={{ width: `${capacityPercent}%` }} />
            </div>
            <p className={styles.kpiSub} style={{ marginTop: "8px" }}>
              {stats.spotsLeft === 0 ? "TUTTO ESAURITO (Sold Out)" : `${stats.spotsLeft} Posti rimasti in vendita`}
            </p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>DISTRIBUZIONE PASS</span>
              <span className={styles.kpiIcon}><IconTicket /></span>
            </div>
            <div className={styles.kpiValue}>{stats.fullPassCount} <span style={{ fontSize: "14px", color: "#f59e0b" }}>Full (2GG)</span></div>
            <p className={styles.kpiSub}>
              Giorno 1: <strong>{stats.day1Count}</strong> | Giorno 2: <strong>{stats.day2Count}</strong>
            </p>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>PRESENZA IN SALA</span>
              <span className={styles.kpiIcon}><IconCheckCircle /></span>
            </div>
            <div className={styles.kpiValue}>
              {attendedCount} <span style={{ fontSize: "18px", color: "#34d399" }}>({bookings.length > 0 ? Math.round((attendedCount / bookings.length) * 100) : 0}%)</span>
            </div>
            <p className={styles.kpiSub}>Check-in effettuati al desk accoglienza</p>
          </div>
        </div>
      )}

      {/* Collapsible Filter & Search Section */}
      <div className={styles.sectionToggleHeader} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
        <div className={styles.sectionTitleGroup}>
          <span>FILTRI & RICERCA AVANZATA</span>
        </div>
        <IconChevron isOpen={isFiltersOpen} />
      </div>

      {isFiltersOpen && (
        <div className={styles.controlsCard}>
          <div className={styles.controlsRow}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><IconSearch /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cerca per Nome, Email, Ticket ID, Telefono o Note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className={styles.filterSelect}
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="all">Tutti i Piani Pass</option>
              <option value="full">Full Seminar (2 Giorni)</option>
              <option value="day1">Giorno 1 (Perceive)</option>
              <option value="day2">Giorno 2 (Adapt)</option>
            </select>

            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tutti gli Stati Pagamento</option>
              <option value="PAID">Pagato (PAID)</option>
              <option value="PENDING">In Attesa (PENDING)</option>
              <option value="REFUNDED">Rimborsato (REFUNDED)</option>
            </select>

            <select
              className={styles.filterSelect}
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
            >
              <option value="all">Tutte le Presenze</option>
              <option value="attended">Presenti (Checked-in)</option>
              <option value="absent">Assenti</option>
            </select>

            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Più Recenti</option>
              <option value="oldest">Meno Recenti</option>
              <option value="name">Nome (A-Z)</option>
              <option value="amount">Importo (€ high-low)</option>
            </select>

            <div className={styles.resultsCounter}>
              Risultati: <strong>{filteredBookings.length}</strong> / {bookings.length}
            </div>
          </div>
        </div>
      )}

      {/* Roster Table Card */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#a1a1aa" }}>
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
              <IconRefresh className={styles.spin} />
            </div>
            Sincronizzazione archivio CRM con Supabase Cloud DB in corso...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#71717a" }}>
            <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
              <IconSearch />
            </div>
            Nessun partecipante trovato con i criteri di ricerca selezionati.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "95px" }}>CHECK-IN</th>
                  <th>PARTECIPIANTE</th>
                  <th>PASS & DISCIPLINA</th>
                  <th>IMPORTO & STATO</th>
                  <th>NOTE CRM</th>
                  <th style={{ textAlign: "right" }}>AZIONI</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
                  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
                  const nameParts = (booking.fullName || "P").trim().split(" ");
                  const initials = nameParts.length >= 2 
                    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                    : booking.fullName.substring(0, 2).toUpperCase();

                  return (
                    <tr
                      key={booking.id || booking.ticketId}
                      className={booking.attended ? styles.trAttended : ""}
                    >
                      <td>
                        <button
                          type="button"
                          className={`${styles.attendanceToggle} ${
                            booking.attended ? styles.attendancePresent : styles.attendanceAbsent
                          }`}
                          onClick={() => handleToggleAttendance(booking.ticketId, booking.attended)}
                          title="Clicca per invertire stato check-in"
                        >
                          {booking.attended ? "✓ PRESENTE" : "○ ASSENTE"}
                        </button>
                      </td>
                      <td>
                        <div className={styles.attendeeCell}>
                          <div className={styles.avatarCircle}>{initials}</div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className={styles.attendeeName}>{booking.fullName}</span>
                              <span
                                className={styles.ticketCode}
                                onClick={() => {
                                  navigator.clipboard.writeText(booking.ticketId);
                                  addToast(`Ticket ID ${booking.ticketId} copiato!`);
                                }}
                                title="Clicca per copiare Ticket ID"
                              >
                                {booking.ticketId}
                              </span>
                            </div>
                            <div className={styles.attendeeMeta}>
                              <span>{booking.email}</span>
                              {booking.phone && <span>• {booking.phone}</span>}
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.waBtn}
                                  title="Apri chat WhatsApp"
                                >
                                  <IconWhatsApp /> WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <div>
                            <span
                              className={`${styles.badgeTag} ${
                                booking.tierKey === "full" ? styles.badgeTierFull : styles.badgeTierDay
                              }`}
                            >
                              {booking.tierName}
                            </span>
                          </div>
                          <div className={styles.attendeeMeta}>
                            <strong style={{ color: "#e4e4e7", fontWeight: 600 }}>{booking.martialSystem}</strong>
                            {booking.experienceLevel && <span>• {booking.experienceLevel}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong style={{ color: "#e1a10b", fontSize: "14px", fontWeight: 800 }}>
                              €{booking.amountPaid}.00
                            </strong>
                            <span
                              className={`${styles.badgeTag} ${
                                booking.paymentStatus === "PAID"
                                  ? styles.badgePaid
                                  : booking.paymentStatus === "PENDING"
                                  ? styles.badgePending
                                  : styles.badgeRefunded
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                const nextStatus = booking.paymentStatus === "PENDING" ? "PAID" : booking.paymentStatus === "PAID" ? "PENDING" : "PAID";
                                handleUpdatePaymentStatus(booking.ticketId, nextStatus);
                              }}
                              title="Clicca per cambiare stato (PENDING ↔ PAID)"
                            >
                              {booking.paymentStatus}
                            </span>
                          </div>
                          <div className={styles.attendeeMeta}>{booking.paymentMethod}</div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.notesInput}
                          placeholder="+ Nota CRM..."
                          defaultValue={booking.notes || ""}
                          onBlur={(e) => handleUpdateNotes(booking.ticketId, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => setSelectedBooking(booking)}
                            title="Dettagli e Modifica"
                          >
                            <IconEye />
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={() => handleDeleteBooking(booking.ticketId)}
                            title="Elimina Iscritto"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Registration Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>REGISTRA NUOVA PRENOTAZIONE</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualBooking}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>NOME COMPLETO *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    required
                    placeholder="Es. Mario Rossi"
                    value={newBooking.fullName}
                    onChange={(e) => setNewBooking({ ...newBooking, fullName: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>EMAIL PARTECIPIANTE *</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    required
                    placeholder="Es. mario.rossi@email.it"
                    value={newBooking.email}
                    onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>TELEFONO / WHATSAPP</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="+39 340 1234567"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>PIANO PASS</label>
                  <select
                    className={styles.formSelect}
                    value={newBooking.tierKey}
                    onChange={(e) => setNewBooking({ ...newBooking, tierKey: e.target.value })}
                  >
                    <option value="full">Full Seminar (2 Giorni) — €140</option>
                    <option value="day1">Day 1 Pass (Perceive) — €80</option>
                    <option value="day2">Day 2 Pass (Adapt) — €80</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>SISTEMA MARZIALE</label>
                  <select
                    className={styles.formSelect}
                    value={newBooking.martialSystem}
                    onChange={(e) => setNewBooking({ ...newBooking, martialSystem: e.target.value })}
                  >
                    <option value="BJJ (Brazilian Jiu-Jitsu)">BJJ (Brazilian Jiu-Jitsu)</option>
                    <option value="Wing Tsun">Wing Tsun / Ving Tsun</option>
                    <option value="MMA / Free Fight">MMA / Free Fight</option>
                    <option value="Muay Thai / Kickboxing">Muay Thai / Kickboxing</option>
                    <option value="Krav Maga / Difesa Personale">Krav Maga / Difesa Personale</option>
                    <option value="Altro / General Combat">Altro / General Combat</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>ESPERIENZA / GRADO</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Es. Cintura Blu, 3 Anni Esperienza..."
                    value={newBooking.experienceLevel}
                    onChange={(e) => setNewBooking({ ...newBooking, experienceLevel: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>METODO DI PAGAMENTO</label>
                  <select
                    className={styles.formSelect}
                    value={newBooking.paymentMethod}
                    onChange={(e) => setNewBooking({ ...newBooking, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Contanti al Desk</option>
                    <option value="stripe">Stripe Card Online</option>
                    <option value="bank_transfer">Bonifico Bancario</option>
                    <option value="guest_pass">Pass Omaggio / Ospite Staff</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>STATO PAGAMENTO</label>
                  <select
                    className={styles.formSelect}
                    value={newBooking.paymentStatus}
                    onChange={(e) => setNewBooking({ ...newBooking, paymentStatus: e.target.value as any })}
                  >
                    <option value="PAID">Pagato (PAID)</option>
                    <option value="PENDING">In Attesa (PENDING)</option>
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>NOTE INTERNE CRM</label>
                  <textarea
                    rows={3}
                    className={styles.formTextarea}
                    placeholder="Note aggiuntive sull'iscrizione..."
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setShowAddModal(false)}
                >
                  ANNULLA
                </button>
                <button
                  type="submit"
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                >
                  SALVA E REGISTRA ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Detail Drawer / Modal with Collapsible Sections */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.ticketCode}>{selectedBooking.ticketId}</span>
                <h3 className={styles.modalTitle} style={{ marginTop: "6px" }}>
                  {selectedBooking.fullName}
                </h3>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setSelectedBooking(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Collapsible Contact Info Panel */}
              <div className={styles.collapsiblePanel}>
                <div
                  className={styles.collapsiblePanelHeader}
                  onClick={() => setModalPanels({ ...modalPanels, contact: !modalPanels.contact })}
                >
                  <span>INFORMAZIONI CONTATTO</span>
                  <IconChevron isOpen={modalPanels.contact} />
                </div>
                {modalPanels.contact && (
                  <div className={styles.collapsiblePanelBody}>
                    <div style={{ fontSize: "14px", color: "#ffffff" }}>
                      <strong>Email:</strong> {selectedBooking.email}
                    </div>
                    {selectedBooking.phone && (
                      <div style={{ marginTop: "6px", fontSize: "14px", color: "#ffffff" }}>
                        <strong>Telefono:</strong> {selectedBooking.phone}
                      </div>
                    )}
                    {selectedBooking.address && (
                      <div style={{ marginTop: "6px", fontSize: "13px", color: "#a1a1aa" }}>
                        <strong>Indirizzo:</strong> {selectedBooking.address}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible Seminar Info Panel */}
              <div className={styles.collapsiblePanel}>
                <div
                  className={styles.collapsiblePanelHeader}
                  onClick={() => setModalPanels({ ...modalPanels, seminar: !modalPanels.seminar })}
                >
                  <span>DETTAGLI SEMINARIO & PIANO</span>
                  <IconChevron isOpen={modalPanels.seminar} />
                </div>
                {modalPanels.seminar && (
                  <div className={styles.collapsiblePanelBody}>
                    <div style={{ fontSize: "14px", color: "#ffffff" }}>
                      <strong>Pass:</strong> {selectedBooking.tierName} (€{selectedBooking.amountPaid}.00)
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "13px", color: "#a1a1aa" }}>
                      <strong>Disciplina:</strong> {selectedBooking.martialSystem} — {selectedBooking.experienceLevel}
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "13px", color: "#a1a1aa" }}>
                      <strong>Data Iscrizione:</strong> {new Date(selectedBooking.createdAt).toLocaleString("it-IT")}
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "13px", color: "#a1a1aa" }}>Stato Pagamento:</strong>
                      <select
                        className={styles.formSelect}
                        style={{ padding: "4px 8px", fontSize: "12px", width: "auto" }}
                        value={selectedBooking.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(selectedBooking.ticketId, e.target.value as any)}
                      >
                        <option value="PAID">Pagato (PAID)</option>
                        <option value="PENDING">In Attesa (PENDING)</option>
                        <option value="REFUNDED">Rimborsato (REFUNDED)</option>
                      </select>
                    </div>

                    {/* Official 2D QR Code Pass Preview */}
                    <div style={{ marginTop: "14px", display: "flex", justifyContent: "center" }}>
                      <TicketPassCodes ticketId={selectedBooking.ticketId} darkTheme={true} qrSize={110} />
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible CRM Notes Panel */}
              <div className={styles.collapsiblePanel}>
                <div
                  className={styles.collapsiblePanelHeader}
                  onClick={() => setModalPanels({ ...modalPanels, notes: !modalPanels.notes })}
                >
                  <span>NOTE INTERNE CRM</span>
                  <IconChevron isOpen={modalPanels.notes} />
                </div>
                {modalPanels.notes && (
                  <div className={styles.collapsiblePanelBody}>
                    <textarea
                      rows={3}
                      className={styles.formTextarea}
                      defaultValue={selectedBooking.notes || ""}
                      onBlur={(e) => handleUpdateNotes(selectedBooking.ticketId, e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
                <button
                  type="button"
                  className={`${styles.attendanceToggle} ${
                    selectedBooking.attended ? styles.attendancePresent : styles.attendanceAbsent
                  }`}
                  style={{ padding: "10px 18px", fontSize: "13px", width: "100%", justifyContent: "center" }}
                  onClick={() => handleToggleAttendance(selectedBooking.ticketId, selectedBooking.attended)}
                >
                  {selectedBooking.attended ? "✓ PRESENTE IN SALA" : "○ ASSENTE — MARCA PRESENTE"}
                </button>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                style={{ width: "auto", padding: "0 14px", height: "38px", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => handleDeleteBooking(selectedBooking.ticketId)}
              >
                <IconTrash /> Elimina Iscrizione
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedBooking(null)}
              >
                CHIUDI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera & Hardware Laser Scanner Modal */}
      {showScannerModal && (
        <ScannerModal
          bookings={bookings}
          onClose={() => setShowScannerModal(false)}
          onAttendanceToggle={handleToggleAttendance}
        />
      )}
    </div>
  );
}
