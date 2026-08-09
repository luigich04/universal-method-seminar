"use client";

import React, { useState, useEffect } from "react";
import styles from "./admin.module.css";

interface BookingRecord {
  id: string;
  ticketId: string;
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

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

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
    } finally {
      setLoading(false);
    }
  };

  const handleLiveRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setLastRefreshed(new Date().toLocaleTimeString("it-IT"));
    setTimeout(() => setIsRefreshing(false), 500);
  };

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

  const handleToggleAttendance = async (ticketId: string, currentAttended: boolean) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action: "toggle_attendance",
          attended: !currentAttended,
        }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.ticketId === ticketId ? { ...b, attended: !currentAttended } : b))
        );
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
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
        fetchBookings();
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
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
      "Importo €",
      "Stato Pagamento",
      "Metodo",
      "Presenza",
      "Note Interne",
      "Data Iscrizione",
    ];

    const rows = bookings.map((b) => [
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
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UMS_Seminar_Roster_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);

    const matchesTier = tierFilter === "all" || b.tierKey === tierFilter;
    const matchesStatus = statusFilter === "all" || b.paymentStatus === statusFilter;

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Login Screen if PIN not entered
  if (!isAuthenticated) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loginCard}>
          <p className={styles.brandSub}>UNIVERSAL METHOD SEMINAR</p>
          <h2 className={styles.brandTitle}>CRM DASHBOARD</h2>
          <p style={{ fontSize: "12px", color: "#8E8880", marginTop: "8px" }}>
            Inserisci il PIN di accesso amministrativo
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

            <button type="submit" className={styles.exportBtn} style={{ width: "100%" }}>
              ACCEDI AL CRM
            </button>
          </form>

          <p style={{ fontSize: "11px", color: "#555", marginTop: "16px" }}>
            PIN Predefinito: <code>ums2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Top Header */}
      <header className={styles.adminHeader}>
        <div className={styles.brandGroup}>
          <h1 className={styles.brandTitle}>CRM SEMINARIO UMS</h1>
          <span className={styles.brandSub}>GESTIONE ISCRITTI & INCASSI • CHRIS COLLINS</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={handleLiveRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "AGGIORNAMENTO..." : "AGGIORNA DATI ↻"}
          </button>
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            EXPORT EXCEL / CSV
          </button>
          <button className={styles.logoutBtn} onClick={() => setIsAuthenticated(false)}>
            ESCI
          </button>
        </div>
      </header>

      {/* 4 KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>INCASSO TOTALE</span>
          <div className={styles.kpiValue}>€{stats.totalRevenue}.00</div>
          <p className={styles.kpiSub}>Transazioni conconfermate su Stripe</p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>POSTI ISCRITTI</span>
          <div className={styles.kpiValue}>
            {stats.totalPaidCount} / {stats.maxCapacity}
          </div>
          <p className={styles.kpiSub}>{stats.spotsLeft} Posti ancora disponibili</p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>FULL SEMINAR (2 GG)</span>
          <div className={styles.kpiValue}>{stats.fullPassCount}</div>
          <p className={styles.kpiSub}>Pass completo €140</p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>PASSI SINGOLI</span>
          <div className={styles.kpiValue}>
            {stats.day1Count + stats.day2Count}
          </div>
          <p className={styles.kpiSub}>Giorno 1: {stats.day1Count} | Giorno 2: {stats.day2Count}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cerca per Nome, Email, Ticket ID o Telefono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

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
          <option value="all">Tutti gli Stati</option>
          <option value="PAID">Pagati (PAID)</option>
          <option value="PENDING">In Attesa</option>
          <option value="REFUNDED">Rimborsati</option>
        </select>
      </div>

      {/* Roster Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Caricamento Iscritti CRM...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#8E8880" }}>
            Nessun iscritto trovato con i filtri attuali.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "40px" }}>PRES.</th>
                <th>TICKET ID</th>
                <th>PARTECIPIANTE</th>
                <th>SISTEMA & LIVELLO</th>
                <th>TIPO PASS</th>
                <th>IMPORTO</th>
                <th>STATO</th>
                <th>NOTE CRM INTERNE</th>
                <th style={{ textAlign: "right" }}>AZIONI</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const cleanPhone = booking.phone.replace(/[^0-9]/g, "");
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

                return (
                  <tr key={booking.id || booking.ticketId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={booking.attended}
                        onChange={() => handleToggleAttendance(booking.ticketId, booking.attended)}
                        style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#e1a10b" }}
                      />
                    </td>
                    <td>
                      <span className={styles.ticketCode}>{booking.ticketId}</span>
                      <div className={styles.attendeeMeta}>
                        {new Date(booking.createdAt).toLocaleDateString("it-IT")}
                      </div>
                    </td>
                    <td>
                      <div className={styles.attendeeName}>{booking.fullName}</div>
                      <div className={styles.attendeeMeta}>
                        {booking.email}
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.waBtn}
                          >
                            WhatsApp ↗
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.martialSystem}</div>
                      <div className={styles.attendeeMeta}>{booking.experienceLevel}</div>
                    </td>
                    <td>
                      <span
                        className={`${styles.badgeTag} ${
                          booking.tierKey === "full" ? styles.badgeTierFull : styles.badgeTierDay
                        }`}
                      >
                        {booking.tierName}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#e1a10b" }}>
                      €{booking.amountPaid}.00
                    </td>
                    <td>
                      <span className={`${styles.badgeTag} ${styles.badgePaid}`}>
                        {booking.paymentStatus}
                      </span>
                      <div className={styles.attendeeMeta}>{booking.paymentMethod}</div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.notesInput}
                        placeholder="Aggiungi nota CRM..."
                        defaultValue={booking.notes || ""}
                        onBlur={(e) => handleUpdateNotes(booking.ticketId, e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteBooking(booking.ticketId)}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
