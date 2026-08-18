"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./Loader.module.css";

export default function Loader() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [hidden, setHidden] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  /* ── Safety timeout (prevents freeze) ── */
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setHidden(true);
    }, 5000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  /* ── 0: Pausa iniziale ── */
  useEffect(() => {
    const d = gsap.delayedCall(0.4, () => setStep(1));
    return () => { d.kill(); };
  }, []);

  /* ── 1: Presents — reveal & exit text animation ── */
  useEffect(() => {
    if (step !== 1 || !titleRef.current || !subRef.current) return;
    const targets = [titleRef.current, subRef.current];

    const tl = gsap.timeline({ onComplete: () => setStep(2) });
    // Reveal: sale da sotto la maschera
    tl.fromTo(targets,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
    )
    // Hold
    .to({}, { duration: 1.0 })
    // Exit: esce sopra la maschera
    .to(targets, {
      yPercent: -112,
      duration: 0.5,
      ease: "power2.in",
      stagger: 0.06,
    });

    return () => { tl.kill(); };
  }, [step]);

  /* ── 2: Curtain exit — svela la Hero ── */
  useEffect(() => {
    if (step !== 2 || !overlayRef.current) return;
    const tl = gsap.timeline({ onComplete: () => setHidden(true) });
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.9,
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

        {/* STEP 1 — YIM WCKF ACADEMY presents */}
        {step === 1 && (
          <div className={styles.textBlock}>
            <div className={styles.maskLine}>
              <span ref={titleRef} className={styles.presentsText}>
                Yim WCKF ACADEMY
              </span>
            </div>
            <div className={styles.maskLine}>
              <span ref={subRef} className={styles.presentsSubText}>
                presents
              </span>
            </div>
          </div>
        )}

        {/* Spinner bianco fisso in basso prima e durante l'animazione */}
        <div className={styles.bottomSpinnerContainer}>
          <span className={styles.whiteSpinner} aria-label="Caricamento..." />
        </div>

      </div>
    </div>
  );
}
