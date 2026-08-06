"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SeminarSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const BLOCKS = [
  {
    num: "01",
    label: "STRUCTURE",
    lead: "Develop a more connected body structure.",
    body: "Learn how to organise the body efficiently, transmit force more clearly and reduce unnecessary tension.",
  },
  {
    num: "02",
    label: "TIMING",
    lead: "Recognise the right moment to act.",
    body: "Refine your sense of timing, distance and pressure to respond with greater clarity and less hesitation.",
  },
  {
    num: "03",
    label: "ADAPTABILITY",
    lead: "Apply principles, not fixed patterns.",
    body: "Explore how to receive, redirect and return force while maintaining balance, intent and functional control.",
  },
];

export default function SeminarSection() {
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
          <p ref={eyebrowRef} className={styles.eyebrow}>The Seminar</p>
          <h2
            ref={headlineRef}
            id="seminar-headline"
            className={styles.headline}
          >
            Train principles that remain<br />
            effective under pressure.
          </h2>
          <p ref={introRef} className={styles.intro}>
            The Universal Method Seminar is an intensive training experience
            focused on structure, timing, adaptability and the intelligent
            management of force. Rather than collecting isolated techniques,
            participants will explore principles that can be tested, understood
            and integrated into their own martial arts practice.
          </p>
        </div>

        {/* ── BLOCKS — 3 columns, single row ── */}
        <div ref={blocksRef} className={styles.blocksRow}>
          {BLOCKS.map((block) => (
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
            <p className={styles.closingLine1}>Not a collection of techniques.</p>
            <p className={styles.closingLine2}>
              A deeper understanding of movement, pressure and application<span className={styles.closingDot}>.</span>
            </p>
          </div>
          <a
            href="#programme"
            className={styles.closingCta}
            id="seminar-view-programme"
          >
            View the Programme
            <span className={styles.ctaArrow} aria-hidden="true">↘</span>
          </a>
        </div>

      </div>
    </section>
  );
}
