"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Magnetic from "./Magnetic";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "The Seminar", id: "the-seminar" },
  { label: "Universal Method", id: "universal-method" },
  { label: "Programme", id: "programme" },
  { label: "FAQ", id: "faq" },
];

interface NavbarProps {
  onOpenReservation?: () => void;
}

export default function Navbar({ onOpenReservation }: NavbarProps) {
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightSection, setIsLightSection] = useState(false);

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
    <header className={`${styles.header} ${pastHero ? styles.headerPastHero : ""} ${isLightSection ? styles.headerLight : ""} ${menuOpen ? styles.headerMenuOpen : ""}`}>
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
              <span className={styles.ctaText}>RESERVE YOUR PLACE</span>
            </a>
          </Magnetic>
        </div>

        {/* RIGHT — Nav links */}
        <div className={styles.links}>
          {NAV_LINKS.map(({ label, id }) => (
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
          {NAV_LINKS.map(({ label, id }, index) => (
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
          <a
            href="#reserve"
            className={styles.mobileOverlayCta}
            onClick={handleCtaClick}
          >
            RESERVE YOUR PLACE
          </a>
        </div>
      </div>
    </header>
  );
}
