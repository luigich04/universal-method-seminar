"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SeminarSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const BLOCKS = [
  {
    num: "01",
    label: "SCALING AND ADAPTABILITY",
    lead: "Progress without losing structure.",
    body: "Through the principle of scaling, every exercise adapts to the practitioner's level. Objectives can be added, reduced, or modified while the core method remains stable as difficulty evolves with the individual.",
  },
  {
    num: "02",
    label: "CERTAINTY AND THE SCARF MODEL",
    lead: "Free up mental resources.",
    body: "Rooted in the SCARF model, the Certainty factor plays a central role: knowing what to do, why, and by what criteria reduces uncertainty, fosters focus, and accelerates motor learning.",
  },
  {
    num: "03",
    label: "SPECIFICITY AND AUTONOMY",
    lead: "Eliminate ambiguity in movement.",
    body: "Every instruction is specific and every exercise has a precise function. By removing ambiguity, practitioners cultivate autonomy, confidence, and focus on the quality of their evolution.",
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
            One single method.<br />
            More clarity, more freedom.
          </h2>
          <p ref={introRef} className={styles.intro}>
            In martial arts practice, what slows growth is not always a lack of commitment, but often an excess of variables: conflicting instructions, subjective interpretations, and poorly defined goals can create dispersion and make learning less effective.<br /><br />
            Chris Collins presents his new Universal Method in Italy, a single, clear, and shared reference system designed to make training more coherent, understandable, and sustainable over time.
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
            <p className={styles.closingLine1}>Not simply new techniques.</p>
            <p className={styles.closingLine2}>
              A clearer way to understand, organize, and develop them into solid, lasting skills<span className={styles.closingDot}>.</span>
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
