"use client";

import Image from "next/image";
import styles from "./Footer.module.css";

interface FooterProps {
  onOpenReservation?: () => void;
}

const QUICK_LINKS = [
  { label: "THE SEMINAR", id: "the-seminar" },
  { label: "UNIVERSAL METHOD", id: "universal-method" },
  { label: "PROGRAMME", id: "programme" },
  { label: "FAQ", id: "faq" },
];

export default function Footer({ onOpenReservation }: FooterProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
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
    <footer className={styles.footerContainer} id="footer">
      {/* Dark Brush Divider Transition from FaqSection */}
      <div className={styles.brushTop} aria-hidden="true">
        <img src="/divisore-footer.png" alt="" />
      </div>

      <div className={styles.footerContent}>
        <div className={styles.inner}>
          
          {/* TOP BAR - SEMINAR LOGOS & TITLE */}
          <div className={styles.topBar}>
            <div className={styles.brand}>
              <Image
                src="/yim-logo-ticket.png"
                alt="Yim Wing Tsun logo"
                width={84}
                height={84}
                className={styles.logoYim}
                unoptimized
              />
              <Image
                src="/logo-header.png"
                alt="Universal Method Seminar logo"
                width={60}
                height={60}
                className={styles.logo}
                unoptimized
              />
              <div className={styles.brandText}>
                <span className={styles.brandTitle}>UNIVERSAL METHOD</span>
                <span className={styles.brandSub}>SEMINAR</span>
              </div>
            </div>
          </div>

          {/* 3 COLUMNS GRID */}
          <div className={styles.columnsGrid}>
            
            {/* COLUMN 1: QUICK LINKS */}
            <div className={`${styles.column} ${styles.colLeft}`}>
              <h4 className={styles.colTitle}>QUICK LINKS</h4>
              <ul className={styles.linksList}>
                {QUICK_LINKS.map(({ label, id }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => handleNavClick(e, id)}
                      className={styles.linkItem}
                    >
                      <span>{label}</span>
                      <span className={styles.linkArrow}>→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 2: EVENT DETAILS */}
            <div className={`${styles.column} ${styles.colCenter}`}>
              <h4 className={styles.colTitle}>EVENT DETAILS</h4>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <a
                    href="https://maps.google.com/?q=Bracciano+Italy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    BRACCIANO, ITALY
                  </a>
                </li>
                <li className={styles.infoItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span>7 AND 8 SEPTEMBER</span>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: CONTACT */}
            <div className={`${styles.column} ${styles.colRight}`}>
              <h4 className={styles.colTitle}>CONTACT</h4>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a href="mailto:yimwckf@gmail.it" className={styles.contactLink}>
                    YIMWCKF@GMAIL.IT
                  </a>
                </li>
                <li className={`${styles.infoItem} ${styles.webContactItem}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20Z" />
                    <path d="M2 12h20" />
                  </svg>
                  <a href="https://universalmethod.seminar" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                    UNIVERSALMETHOD.SEMINAR
                  </a>
                </li>
                <li className={styles.infoItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e1a10b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <a
                    href="mailto:yimwckf@gmail.it?subject=Richiesta%20Sponsor&body=Ciao,%20vorrei%20partecipare%20come%20sponsor%20al%20vostro%20progetto,%20sono:"
                    className={styles.sponsorContactLink}
                  >
                    DIVENTA SPONSOR
                  </a>
                </li>
              </ul>
            </div>

            {/* WATERMARK LOGO */}
            <div className={styles.watermarkWrapper} aria-hidden="true">
              <img src="/yim-logo-ticket.png" alt="" className={styles.watermark} />
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className={styles.bottomBar}>
            <div className={styles.bottomCenter}>
              <div>© 2025 UNIVERSAL METHOD SEMINAR. ALL RIGHTS RESERVED.</div>
              <div className={styles.meedaCredit}>
                WEBSITE BY <a href="https://meeda.it" target="_blank" rel="noopener noreferrer" className={styles.meedaLink}>MEEDA STUDIO</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
