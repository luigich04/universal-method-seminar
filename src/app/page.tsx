"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SeminarSection from "@/components/SeminarSection";
import MartialDivider from "@/components/MartialDivider";
import MethodSection from "@/components/MethodSection";
import BrushDivider from "@/components/BrushDivider";
import ProgrammeSection from "@/components/ProgrammeSection";
import ReservationModal from "@/components/ReservationModal";
import styles from "./page.module.css";

function MainContent() {
  const searchParams = useSearchParams();
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [sessionId, setSessionId] = useState("");

  const openReservation = () => {
    setModalStep(1);
    setIsReservationOpen(true);
  };
  const closeReservation = () => setIsReservationOpen(false);

  // Auto-open modal on Step 5 (Confirmation Ticket Pass "YOU ARE IN.") & confirm payment with Stripe
  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    const sid = searchParams.get("session_id");
    if (isSuccess && sid) {
      setModalStep(5);
      setIsReservationOpen(true);

      // Call backend API to confirm payment with Stripe & update DB status to PAID
      fetch(`/api/stripe-confirm?session_id=${encodeURIComponent(sid)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ticketId) {
            setSessionId(data.ticketId);
          } else {
            setSessionId(`UMS-${sid.slice(-6).toUpperCase()}`);
          }
          if (data.customerName && data.customerName !== "Partecipante") {
            try { localStorage.setItem("ums_name", data.customerName); } catch (e) {}
          }
          if (data.customerEmail) {
            try { localStorage.setItem("ums_email", data.customerEmail); } catch (e) {}
          }
        })
        .catch((err) => {
          console.warn("Stripe confirm notice:", err);
          setSessionId(`UMS-${sid.slice(-6).toUpperCase()}`);
        });
    } else if (isSuccess) {
      setModalStep(5);
      setSessionId(`UMS-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsReservationOpen(true);
    }
  }, [searchParams]);

  // Global listener for smooth anchor scrolling & modal triggering
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href === "#reserve") {
        e.preventDefault();
        openReservation();
        return;
      }

      if (href.startsWith("#") && href.length > 1) {
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          const lenis = (window as any).lenis;
          if (lenis && typeof lenis.scrollTo === "function") {
            lenis.scrollTo(element, { offset: -80, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <main>
      {/* <Loader /> */}
      <CustomCursor />
      <Navbar onOpenReservation={openReservation} />
      <Hero onOpenReservation={openReservation} />
      <div className={styles.seminarWrapper}>
        <SeminarSection />
        <MartialDivider />
      </div>
      <MethodSection />
      <BrushDivider />
      <ProgrammeSection onOpenReservation={openReservation} />
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={closeReservation}
        initialStep={modalStep}
        initialSessionId={sessionId}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <MainContent />
    </Suspense>
  );
}
