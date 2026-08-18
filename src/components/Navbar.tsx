"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Magnetic from "./Magnetic";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Navbar.module.css";

interface NavbarProps {
  onOpenReservation?: () => void;
}

const FlagIT = () => (
  <svg width="22" height="15" viewBox="0 0 640 480" style={{ borderRadius: 2, display: "block" }}>
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#009246" d="M0 0h213.3v480H0z"/>
      <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

const FlagEN = () => (
  <svg width="22" height="15" viewBox="0 0 640 480" style={{ borderRadius: 2, display: "block" }}>
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#fff" d="m75 0 245 180L565 0h75v55L415 240l225 185v55h-75L320 300 75 480H0v-55l225-185L0 55V0h75z"/>
    <path fill="#C8102E" d="m425 240 215 175v35L400 265l25-25zm-210 0L0 65V30l240 185-25 25zm215-30L640 35V0L390 190l40 20zM210 270 0 435v45l250-190-40-20z"/>
    <path fill="#fff" d="M240 0v480h160V0H240zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M270 0v480h100V0H270zM0 190v100h640V190H0z"/>
  </svg>
);

export default function Navbar({ onOpenReservation }: NavbarProps) {
  const { lang, dict, switchLanguage } = useLanguage();
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

  const navLinks = [
    { label: dict.nav.seminar, id: "the-seminar" },
    { label: dict.nav.method, id: "universal-method" },
    { label: dict.nav.programme, id: "programme" },
    { label: dict.nav.faq, id: "faq" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.85);

      // Detect if navbar (top 75px) overlaps light background sections (Universal Method, FAQ, Footer)
      const navY = 75;
      const lightSectionIds = ["universal-method", "faq", "footer"];

      for (const id of lightSectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navY && rect.bottom >= 20) {
            setIsLightSection(true);
            return;
          }
        }
      }
      setIsLightSection(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuOpen) setMenuOpen(false);
    if (onOpenReservation) onOpenReservation();
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (menuOpen) setMenuOpen(false);

    const element = document.getElementById(id);
    if (element) {
      const lenis = (window as any).lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(element, { offset: -80, duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`${styles.header} ${pastHero ? styles.headerPastHero : ""} ${
        isLightSection ? styles.headerLight : ""
      } ${menuOpen ? styles.headerMenuOpen : ""}`}
    >
      <nav className={styles.nav} aria-label="Main navigation">
        {/* LEFT — Brand */}
        <Magnetic strength={0.25}>
          <div className={styles.brand}>
            <Image
              src="/logo-header.png"
              alt="Universal Method Seminar logo"
              width={34}
              height={34}
              className={styles.logo}
              priority
              unoptimized
            />
            <span className={styles.brandName}>
              Universal Method<br />
              <span className={styles.brandSeminar}>Seminar</span>
            </span>
          </div>
        </Magnetic>

        {/* CENTER — CTA (scroll-triggered) */}
        <div className={`${styles.ctaWrapper} ${pastHero ? styles.ctaVisible : ""}`}>
          <Magnetic strength={0.4}>
            <a href="#reserve" onClick={handleCtaClick} className={styles.cta} id="nav-reserve-place">
              <span className={styles.ctaText}>{dict.nav.reservePlace}</span>
            </a>
          </Magnetic>
        </div>

        {/* RIGHT — Nav links + Language Switcher */}
        <div className={styles.links}>
          {navLinks.map(({ label, id }) => (
            <Magnetic key={id} strength={0.35}>
              <a
                href={`#${id}`}
                onClick={(e) => handleNavClick(e, id)}
                className={styles.link}
                id={`nav-${id}`}
              >
                {label}
              </a>
            </Magnetic>
          ))}

          {/* Language Switcher */}
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === "it" ? styles.langBtnActive : ""}`}
              onClick={() => switchLanguage("it")}
              aria-label="Passa all'Italiano"
              title="Italiano"
            >
              <FlagIT />
            </button>
            <button
              className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
              onClick={() => switchLanguage("en")}
              aria-label="Switch to English"
              title="English"
            >
              <FlagEN />
            </button>
          </div>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          className={`${styles.mobileMenuButton} ${menuOpen ? styles.mobileMenuButtonActive : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
      </nav>

      {/* MOBILE OVERLAY MENU */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.mobileOverlayOpen : ""}`}>
        <div className={styles.mobileOverlayLinks}>
          {navLinks.map(({ label, id }, index) => (
            <a
              key={id}
              href={`#${id}`}
              className={styles.mobileOverlayLink}
              style={{ transitionDelay: `${index * 50}ms` }}
              onClick={(e) => handleNavClick(e, id)}
            >
              {label}
            </a>
          ))}

          {/* Mobile Language Switcher */}
          <div className={styles.langToggle} style={{ marginTop: 12 }}>
            <button
              className={`${styles.langBtn} ${lang === "it" ? styles.langBtnActive : ""}`}
              onClick={() => {
                setMenuOpen(false);
                switchLanguage("it");
              }}
              aria-label="Passa all'Italiano"
              title="Italiano"
            >
              <FlagIT />
            </button>
            <button
              className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
              onClick={() => {
                setMenuOpen(false);
                switchLanguage("en");
              }}
              aria-label="Switch to English"
              title="English"
            >
              <FlagEN />
            </button>
          </div>

          <a href="#reserve" className={styles.mobileOverlayCta} onClick={handleCtaClick}>
            {dict.nav.reservePlace}
          </a>
        </div>
      </div>
    </header>
  );
}
