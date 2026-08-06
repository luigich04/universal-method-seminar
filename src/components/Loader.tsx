"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./Loader.module.css";

export default function Loader() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [hidden, setHidden] = useState(false);

  const overlayRef    = useRef<HTMLDivElement>(null);
  const innerRef      = useRef<HTMLDivElement>(null);
  const titleRef      = useRef<HTMLSpanElement>(null);
  const subRef        = useRef<HTMLSpanElement>(null);
  const seminarRef    = useRef<HTMLDivElement>(null);

  /* ── Safety timeout & tap to dismiss (prevents freeze) ── */
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setHidden(true);
    }, 8000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  /* ── 0: pausa iniziale ────────────────────────────── */
  useEffect(() => {
    const d = gsap.delayedCall(0.6, () => setStep(1));
    return () => { d.kill(); };
  }, []);

  /* ── 1: presents — text masking GSAP ─────────────── */
  useEffect(() => {
    if (step !== 1 || !titleRef.current || !subRef.current) return;
    const targets = [titleRef.current, subRef.current];

    const tl = gsap.timeline({ onComplete: () => setStep(2) });
    // Reveal: sale da sotto la maschera
    tl.fromTo(targets,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 }
    )
    // Hold
    .to({}, { duration: 1.15 })
    // Exit: esce sopra la maschera
    .to(targets, {
      yPercent: -112,
      duration: 0.6,
      ease: "power2.in",
      stagger: 0.07,
    });

    return () => { tl.kill(); };
  }, [step]);

  /* ── 2: pausa intermedia vuota ────────────────────── */
  useEffect(() => {
    if (step !== 2) return;
    const d = gsap.delayedCall(0.5, () => setStep(3));
    return () => { d.kill(); };
  }, [step]);

  /* ── 3: seminar slam + screen shake ──────────────── */
  useEffect(() => {
    if (step !== 3 || !seminarRef.current || !innerRef.current) return;
    const el     = seminarRef.current;
    const inner  = innerRef.current;

    // Testo: slam da sopra con overshoot multi-step
    const tl = gsap.timeline({ onComplete: () => setStep(4) });

    tl.fromTo(el,
      { y: -320, scale: 2.3, opacity: 0 },
      { y: 18, scale: 0.91, opacity: 1, duration: 0.28, ease: "power4.in" }
    )
    .to(el, { y: -9,  scale: 1.05, duration: 0.13, ease: "power2.out" })
    .to(el, { y:  5,  scale: 0.98, duration: 0.09, ease: "power2.in"  })
    .to(el, { y: -2,  scale: 1.01, duration: 0.07, ease: "power2.out" })
    .to(el, { y:  0,  scale: 1,    duration: 0.07, ease: "power2.inOut" })
    .to({}, { duration: 2.7 })
    .to(el, { y: -24, opacity: 0, duration: 0.6, ease: "power2.in" });

    // Screen shake — GSAP keyframes, sincronizzato con l'impatto (delay 0.26s)
    gsap.to(inner, {
      keyframes: [
        { x: -14, y: -7,  duration: 0.04 },
        { x:  14, y:  7,  duration: 0.04 },
        { x: -10, y: -5,  duration: 0.04 },
        { x:  10, y:  5,  duration: 0.04 },
        { x:  -6, y: -3,  duration: 0.04 },
        { x:   6, y:  3,  duration: 0.04 },
        { x:  -3, y: -1,  duration: 0.035 },
        { x:   0, y:  0,  duration: 0.035 },
      ],
      delay: 0.26,
      ease: "none",
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(inner);
      gsap.set(inner, { clearProps: "x,y" });
    };
  }, [step]);

  /* ── 4: curtain exit ──────────────────────────────── */
  useEffect(() => {
    if (step !== 4 || !overlayRef.current) return;
    const tl = gsap.timeline({ onComplete: () => setHidden(true) });
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 1.1,
      ease: "power3.inOut",
    });
    return () => { tl.kill(); };
  }, [step]);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.loaderOverlay}
      aria-hidden="true"
      onClick={() => setHidden(true)}
      style={{ cursor: "pointer" }}
    >
      <div ref={innerRef} className={styles.loaderInner}>

        <div className={styles.loaderCementTexture} />

        <div className={styles.loaderWatermark}>
          <Image
            src="/logo-yim.png"
            alt=""
            width={600}
            height={600}
            className={styles.watermarkImg}
            unoptimized
          />
        </div>

        {/* STEP 1 — presents: text masking */}
        {step === 1 && (
          <div className={styles.textBlock}>
            <div className={styles.maskLine}>
              <span ref={titleRef} className={styles.presentsText}>
                Yim WCKF ACCADEMY
              </span>
            </div>
            <div className={styles.maskLine}>
              <span ref={subRef} className={styles.presentsSubText}>
                presents
              </span>
            </div>
          </div>
        )}

        {/* STEP 3 — seminar: slam */}
        {step === 3 && (
          <div className={`${styles.textBlock} ${styles.seminarBlock}`}>
            <div ref={seminarRef} className={styles.seminarImpact}>
              <h1 className={styles.seminarTitle}>
                UNIVERSAL METHOD
              </h1>
              <h1 className={`${styles.seminarTitle} ${styles.seminarTitleGold}`}>
                SEMINAR
              </h1>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
