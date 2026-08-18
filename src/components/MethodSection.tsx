"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./MethodSection.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function MethodSection() {
  const { dict } = useLanguage();
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
            <p ref={labelRef} className={styles.label}>{dict.method.label}</p>
            <h2
              ref={headlineRef}
              id="method-headline"
              className={styles.headline}
            >
              {dict.method.headlineLine1}<br />
              {dict.method.headlineLine2}<br />
              {dict.method.headlineLine3}
            </h2>
            <p ref={introRef} className={styles.intro}>
              {dict.method.intro}
            </p>
            <p ref={introSubRef} className={styles.introSub}>
              {dict.method.introSub}
            </p>
          </div>

          {/* spacer column */}
          <div aria-hidden="true" />

          {/* RIGHT — four principles */}
          <div ref={principlesRef} className={styles.right}>
            {dict.method.principles.map((p: { num: string; keyword: string; lead: string; body: string }) => (
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
            <p className={styles.closingLine}>{dict.method.closingLine1}</p>
            <p className={styles.closingLine}>
              {dict.method.closingLine2}<span className={styles.closingDot}>.</span>
            </p>
          </div>
          <a
            href="#programme"
            className={styles.closingCta}
            id="method-explore-programme"
          >
            {dict.method.exploreProgramme}
            <span className={styles.ctaArrow} aria-hidden="true">↘</span>
          </a>
        </div>
      </div>
    </section>
  );
}
