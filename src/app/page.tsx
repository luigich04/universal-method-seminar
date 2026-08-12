"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SponsorsMarquee from "@/components/SponsorsMarquee";
import SeminarSection from "@/components/SeminarSection";
import MartialDivider from "@/components/MartialDivider";
import MethodSection from "@/components/MethodSection";
import BrushDivider from "@/components/BrushDivider";
import ProgrammeSection from "@/components/ProgrammeSection";
import FaqDivider from "@/components/FaqDivider";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
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
    const successParam = searchParams.get("success");
    const sessionParam = searchParams.get("session_id");

    if (successParam === "true" && sessionParam) {
      // Fetch ticketId assigned in session metadata
      fetch(`/api/stripe-confirm?session_id=${sessionParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ticketId) {
            setSessionId(data.ticketId);
          } else {
            setSessionId(sessionParam);
          }
          setModalStep(5);
          setIsReservationOpen(true);
        })
        .catch((err) => {
          console.error("Error confirming stripe session:", err);
          setSessionId(sessionParam);
          setModalStep(5);
          setIsReservationOpen(true);
        });
    }
  }, [searchParams]);

  // Smooth scroll handler for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href === "#reserve") {
          e.preventDefault();
          openReservation();
          return;
        }
        if (href && href.startsWith("#") && href.length > 1) {
          e.preventDefault();
          const elem = document.querySelector(href);
          if (elem) {
            elem.scrollIntoView({ behavior: "smooth" });
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
      <SponsorsMarquee />
      <div className={styles.seminarWrapper}>
        <SeminarSection />
        <MartialDivider />
      </div>
      <MethodSection />
      <BrushDivider />
      <div className={styles.programmeWrapper}>
        <ProgrammeSection onOpenReservation={openReservation} />
        <FaqDivider />
      </div>
      <FaqSection onOpenReservation={openReservation} />
      <Footer onOpenReservation={openReservation} />
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
