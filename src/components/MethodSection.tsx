"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MethodSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    num: "01",
    keyword: "SCALING",
    lead: "Adapt to level and needs.",
    body: "Objectives can be added, reduced, or progressively modified without losing the path's structure. The method stays stable while difficulty evolves alongside the person.",
  },
  {
    num: "02",
    keyword: "CERTAINTY",
    lead: "SCARF Model principle.",
    body: "Knowing what to do, why to do it, and by what criteria reduces uncertainty, frees mental resources, and consolidates motor learning more effectively.",
  },
  {
    num: "03",
    keyword: "SPECIFICITY",
    lead: "Precise function for every exercise.",
    body: "Every instruction is specific and targeted. By reducing the margin of ambiguity, practitioners focus on the quality of movement and authentic growth.",
  },
  {
    num: "04",
    keyword: "AUTONOMY",
    lead: "Build solid, lasting competence.",
    body: "Rather than imitating isolated techniques, practitioners gain a unified framework to organize and develop skills with confidence and self-reliance.",
  },
];

export default function MethodSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const introSubRef = useRef<HTMLParagraphElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const ease = "power3.out";

      /* ── Label ── */
      gsap.from(labelRef.current, {
        scrollTrigger: { trigger: labelRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 10, opacity: 0, duration: 0.65, ease,
      });

      /* ── Headline ── */
      gsap.from(headlineRef.current, {
        scrollTrigger: { trigger: headlineRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 28, opacity: 0, duration: 0.9, ease, delay: 0.06,
      });

      /* ── Intro paragraphs ── */
      gsap.from([introRef.current, introSubRef.current], {
        scrollTrigger: { trigger: introRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 16, opacity: 0, duration: 0.85, ease,
        stagger: 0.12, delay: 0.12,
      });

      /* ── Principles — stagger on scroll ── */
      if (principlesRef.current) {
        const items = principlesRef.current.querySelectorAll("[data-principle]");
        items.forEach((el) => {
          gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
            y: 24, opacity: 0, duration: 0.8, ease,
          });
        });
      }

      /* ── Closing ── */
      gsap.from(closingRef.current, {
        scrollTrigger: { trigger: closingRef.current, start: "top 88%", toggleActions: "play none none none" },
        y: 18, opacity: 0, duration: 0.85, ease,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="universal-method"
      className={styles.section}
      style={{ scrollMarginTop: "80px" }}
      aria-labelledby="method-headline"
    >
      <div className={styles.inner}>

        {/* ── ASYMMETRIC GRID ── */}
        <div className={styles.grid}>

          {/* LEFT — sticky label / headline / intro */}
          <div className={styles.left}>
            <p ref={labelRef} className={styles.label}>Universal Method</p>
            <h2
              ref={headlineRef}
              id="method-headline"
              className={styles.headline}
            >
              A single structure.<br />Adaptable to any<br />level and context.
            </h2>
            <p ref={introRef} className={styles.intro}>
              Chris Collins&apos; Universal Method does not simply propose new techniques, but a clearer way to understand, organize, and develop them.
            </p>
            <p ref={introSubRef} className={styles.introSub}>
              A single, shared reference system that reduces ambiguity and creates a coherent framework for long-term progress.
            </p>
          </div>

          {/* spacer column */}
          <div aria-hidden="true" />

          {/* RIGHT — four principles */}
          <div ref={principlesRef} className={styles.right}>
            {PRINCIPLES.map((p) => (
              <div
                key={p.num}
                data-principle
                className={styles.principle}
              >
                <p className={styles.principleNum}>{p.num}</p>
                <p className={styles.principleKeyword}>{p.keyword}</p>
                <p className={styles.principleLead}>{p.lead}</p>
                <p className={styles.principleBody}>{p.body}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── CLOSING — below the grid ── */}
        <div ref={closingRef} className={styles.closing}>
          <div className={styles.closingStatement}>
            <p className={styles.closingLine}>Fewer variables.</p>
            <p className={styles.closingLine}>
              More clarity, more freedom<span className={styles.closingDot}>.</span>
            </p>
          </div>
          <a
            href="#programme"
            className={styles.closingCta}
            id="method-explore-programme"
          >
            Explore the Programme
            <span className={styles.ctaArrow} aria-hidden="true">↘</span>
          </a>
        </div>

      </div>
    </section>
  );
}
