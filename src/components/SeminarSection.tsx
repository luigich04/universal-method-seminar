"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./SeminarSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function SeminarSection() {
  const { dict } = useLanguage();
  const sectionRef  = useRef<HTMLElement>(null);
  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const introRef    = useRef<HTMLParagraphElement>(null);
  const blocksRef   = useRef<HTMLDivElement>(null);
  const closingRef  = useRef<HTMLDivElement>(null);

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
        y: 26, opacity: 0, duration: 0.9, ease, delay: 0.08,
      });

      /* ── Intro ── */
      gsap.from(introRef.current, {
        scrollTrigger: { trigger: introRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 18, opacity: 0, duration: 0.85, ease, delay: 0.14,
      });

      /* ── Blocks — stagger across the 3 columns ── */
      if (blocksRef.current) {
        const blockEls = blocksRef.current.querySelectorAll("[data-block]");
        gsap.from(blockEls, {
          scrollTrigger: { trigger: blocksRef.current, start: "top 82%", toggleActions: "play none none none" },
          y: 30, opacity: 0, duration: 0.8, ease,
          stagger: { amount: 0.4, from: "start" },
        });
      }

      /* ── Closing ── */
      gsap.from(closingRef.current, {
        scrollTrigger: { trigger: closingRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 18, opacity: 0, duration: 0.85, ease, delay: 0.1,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="the-seminar"
      className={styles.section}
      style={{ scrollMarginTop: "80px" }}
      aria-labelledby="seminar-headline"
    >
      <div className={styles.inner}>

        {/* ── TOP ── */}
        <div className={styles.top}>
          <p ref={eyebrowRef} className={styles.eyebrow}>{dict.seminar.eyebrow}</p>
          <h2
            ref={headlineRef}
            id="seminar-headline"
            className={styles.headline}
          >
            {dict.seminar.headlineLine1}<br />
            {dict.seminar.headlineLine2}
          </h2>
          <p ref={introRef} className={styles.intro}>
            {dict.seminar.introPart1}<br /><br />
            {dict.seminar.introPart2}
          </p>
        </div>

        {/* ── BLOCKS — 3 columns, single row ── */}
        <div ref={blocksRef} className={styles.blocksRow}>
          {dict.seminar.blocks.map((block: { num: string; label: string; lead: string; body: string }) => (
            <div key={block.num} data-block className={styles.block}>
              <p className={styles.blockNum}>{block.num}</p>
              <p className={styles.blockTitle}>{block.label}</p>
              <p className={styles.blockLead}>{block.lead}</p>
              <p className={styles.blockBody}>{block.body}</p>
            </div>
          ))}
        </div>

        {/* ── CLOSING — below the columns, right-aligned ── */}
        <div ref={closingRef} className={styles.closing}>
          <div className={styles.closingText}>
            <p className={styles.closingLine1}>{dict.seminar.closing1}</p>
            <p className={styles.closingLine2}>
              {dict.seminar.closing2}<span className={styles.closingDot}>.</span>
            </p>
          </div>
          <a
            href="#programme"
            className={styles.closingCta}
            id="seminar-view-programme"
          >
            {dict.seminar.viewProgramme}
            <span className={styles.ctaArrow} aria-hidden="true">↘</span>
          </a>
        </div>

      </div>
    </section>
  );
}
