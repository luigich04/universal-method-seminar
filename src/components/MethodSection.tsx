"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./MethodSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    num: "01",
    keyword: "PERCEIVE",
    lead: "Read what is actually happening.",
    body: "Recognise structure, intention, distance and pressure before committing to a response.",
  },
  {
    num: "02",
    keyword: "ADAPT",
    lead: "Respond to the situation, not to a pattern.",
    body: "Allow the action to emerge from the conditions in front of you rather than forcing a predetermined solution.",
  },
  {
    num: "03",
    keyword: "CONNECT",
    lead: "Organise the body as one functional unit.",
    body: "Integrate movement, balance and force without relying on isolated muscular effort.",
  },
  {
    num: "04",
    keyword: "APPLY",
    lead: "Turn understanding into functional action.",
    body: "Test principles through contact, resistance and progressively less predictable situations.",
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
              A system for<br />understanding.<br />Not imitating.
            </h2>
            <p ref={introRef} className={styles.intro}>
              The Universal Method is not a fixed style or a collection of
              predetermined responses. It is a framework for understanding how
              structure, movement, timing and force interact in constantly
              changing situations.
            </p>
            <p ref={introSubRef} className={styles.introSub}>
              The objective is not to reproduce an ideal movement, but to
              recognise the principles that make effective action possible.
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
            <p className={styles.closingLine}>Different situations.</p>
            <p className={styles.closingLine}>
              One underlying logic<span className={styles.closingDot}>.</span>
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
