"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProgrammeSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const DAYS = [
  {
    num: "01",
    date: "7 SEPTEMBER",
    time: "17:00 — 20:00",
    title: "PERCEIVE",
    tagline: "Read what is actually happening.",
    body: "Recognise structure, intention, distance and pressure before committing to a response.",
    themes: ["STRUCTURE", "DISTANCE", "PRESSURE", "INTENTION"],
  },
  {
    num: "02",
    date: "8 SEPTEMBER",
    time: "10:00 — 13:00",
    title: "ADAPT AND RESPOND",
    tagline: "Move according to reality.",
    body: "Develop timing, angles and mechanics that remain functional across different systems and combat ranges.",
    themes: ["TIMING", "ANGLES", "MECHANICS", "APPLICATION"],
  },
];

interface ProgrammeSectionProps {
  onOpenReservation?: () => void;
}

export default function ProgrammeSection({ onOpenReservation }: ProgrammeSectionProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const eyebrowRef   = useRef<HTMLParagraphElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const introTextRef = useRef<HTMLParagraphElement>(null);
  const day1Ref      = useRef<HTMLDivElement>(null);
  const day2Ref      = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenReservation) onOpenReservation();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = "power3.out";

      /* ── Eyebrow ── */
      gsap.from(eyebrowRef.current, {
        scrollTrigger: { trigger: eyebrowRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 12, opacity: 0, duration: 0.7, ease,
      });

      /* ── Headline ── */
      gsap.from(headlineRef.current, {
        scrollTrigger: { trigger: headlineRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 28, opacity: 0, duration: 0.9, ease, delay: 0.08,
      });

      /* ── Intro Text ── */
      gsap.from(introTextRef.current, {
        scrollTrigger: { trigger: introTextRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 18, opacity: 0, duration: 0.85, ease, delay: 0.14,
      });

      /* ── Day 1 Row ── */
      if (day1Ref.current) {
        gsap.from(day1Ref.current, {
          scrollTrigger: { trigger: day1Ref.current, start: "top 85%", toggleActions: "play none none none" },
          y: 24, opacity: 0, duration: 0.85, ease,
        });
      }

      /* ── Day 2 Row ── */
      if (day2Ref.current) {
        gsap.from(day2Ref.current, {
          scrollTrigger: { trigger: day2Ref.current, start: "top 85%", toggleActions: "play none none none" },
          y: 24, opacity: 0, duration: 0.85, ease,
        });
      }

      /* ── CTA ── */
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", toggleActions: "play none none none" },
          y: 30, opacity: 0, duration: 0.9, ease,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="programme"
      className={styles.section}
      style={{ scrollMarginTop: "80px" }}
      aria-labelledby="programme-headline"
    >
      <div className={styles.inner}>

        {/* ── TOP INTRO HEADER: 2 COLUMNS (TITLE LEFT, DESCRIPTION RIGHT) ── */}
        <div className={styles.introGrid}>
          <div className={styles.introLeft}>
            <p ref={eyebrowRef} className={styles.eyebrow}>The Programme</p>
            <h2
              ref={headlineRef}
              id="programme-headline"
              className={styles.headline}
            >
              Two days.<br />One method.
            </h2>
          </div>
          <div className={styles.introRight}>
            <p ref={introTextRef} className={styles.introText}>
              A progressive exploration of movement, pressure and application.<br />
              Not a collection of techniques. A system for understanding.
            </p>
          </div>
        </div>

        {/* ── DAYS LIST: HORIZONTAL 3-COLUMN ROWS ── */}
        <div className={styles.daysList}>

          {/* Day 1 */}
          <div ref={day1Ref} className={styles.dayRow}>
            <div className={styles.dayColNum}>
              <span className={styles.dayNum}>{DAYS[0].num}</span>
            </div>
            <div className={styles.dayColMain}>
              <h3 className={styles.dayTitle}>{DAYS[0].title}</h3>
              <p className={styles.dayTagline}>{DAYS[0].tagline}</p>
              <p className={styles.dayBody}>{DAYS[0].body}</p>
              <p className={styles.dayThemes}>{DAYS[0].themes.join(" · ")}</p>
            </div>
            <div className={styles.dayColMeta}>
              <span className={styles.dayDate}>{DAYS[0].date}</span>
              <span className={styles.dayTime}>{DAYS[0].time}</span>
            </div>
          </div>

          {/* Day 2 */}
          <div ref={day2Ref} className={styles.dayRow}>
            <div className={styles.dayColNum}>
              <span className={styles.dayNum}>{DAYS[1].num}</span>
            </div>
            <div className={styles.dayColMain}>
              <h3 className={styles.dayTitle}>{DAYS[1].title}</h3>
              <p className={styles.dayTagline}>{DAYS[1].tagline}</p>
              <p className={styles.dayBody}>{DAYS[1].body}</p>
              <p className={styles.dayThemes}>{DAYS[1].themes.join(" · ")}</p>
            </div>
            <div className={styles.dayColMeta}>
              <span className={styles.dayDate}>{DAYS[1].date}</span>
              <span className={styles.dayTime}>{DAYS[1].time}</span>
            </div>
          </div>

        </div>

        {/* ── CLOSING CTA ── */}
        <div ref={ctaRef} className={styles.cta} id="programme-cta">
          <div className={styles.ctaText}>
            <p className={styles.ctaHeadline}>Ready to experience<br />the method?</p>
            <p className={styles.ctaSub}>Limited places available. Open to martial arts practitioners of all systems.</p>
          </div>
          <a
            href="#reserve"
            onClick={handleCtaClick}
            className={styles.ctaButton}
            id="programme-reserve"
            aria-label="Reserve your place at the Universal Method Seminar"
          >
            Reserve your place
            <span className={styles.ctaArrow} aria-hidden="true">↗</span>
          </a>
        </div>

      </div>
    </section>
  );
}
