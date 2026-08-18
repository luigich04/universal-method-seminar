"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FaqDivider.module.css";

export default function FaqDivider() {
  const stageRef = useRef<HTMLDivElement>(null);
  const templeRef = useRef<HTMLImageElement>(null);

  const lanternTopLeftRef = useRef<HTMLDivElement>(null);
  const lanternTopRightRef = useRef<HTMLDivElement>(null);
  const lanternBottomLeftRef = useRef<HTMLDivElement>(null);
  const lanternBottomRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check reduced motion preference for accessibility
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const stage = stageRef.current;
    const temple = templeRef.current;
    const lTL = lanternTopLeftRef.current;
    const lTR = lanternTopRightRef.current;
    const lBL = lanternBottomLeftRef.current;
    const lBR = lanternBottomRightRef.current;

    if (!stage || !temple || !lTL || !lTR || !lBL || !lBR) return;

    // 1. LANTERN BASE SWAY
    const swayTL = gsap.fromTo(
      lTL,
      { rotation: -6 },
      {
        rotation: 6,
        duration: 3.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 0%",
      }
    );

    const swayTR = gsap.fromTo(
      lTR,
      { rotation: 6 },
      {
        rotation: -6,
        duration: 4.4,
        delay: 0.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 0%",
      }
    );

    const swayBL = gsap.fromTo(
      lBL,
      { rotation: -5 },
      {
        rotation: 5,
        duration: 4.0,
        delay: 0.3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 0%",
      }
    );

    const swayBR = gsap.fromTo(
      lBR,
      { rotation: 5 },
      {
        rotation: -5,
        duration: 3.8,
        delay: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 0%",
      }
    );

    // 2. SCROLL REACTION
    const isMobile = window.innerWidth <= 768;
    let scrollTriggerCtx: gsap.Context | null = null;

    if (!isMobile) {
      scrollTriggerCtx = gsap.context(() => {
        gsap.fromTo(
          stage,
          { y: 120, scale: 1.0 },
          {
            y: -120,
            scale: 1.08,
            transformOrigin: "center bottom",
            ease: "none",
            scrollTrigger: {
              trigger: stage,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }, stage);
    }

    // Cleanup
    return () => {
      swayTL.kill();
      swayTR.kill();
      swayBL.kill();
      swayBR.kill();
      if (scrollTriggerCtx) {
        scrollTriggerCtx.revert();
      }
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.faqDividerStage} aria-hidden="true">
      {/* IMMAGINE PRINCIPALE TEMPIO */}
      <img
        ref={templeRef}
        src="/divisore-faq.png"
        alt=""
        className={styles.templeImg}
      />

      {/* 1. LANTERNA TOP LEFT */}
      <div
        ref={lanternTopLeftRef}
        className={`${styles.lanternWrapper} ${styles.lanternTopLeft}`}
      >
        <img
          src="/lanterne/lanterna-sx.png"
          alt=""
          className={styles.lanternImg}
        />
      </div>

      {/* 2. LANTERNA TOP RIGHT */}
      <div
        ref={lanternTopRightRef}
        className={`${styles.lanternWrapper} ${styles.lanternTopRight}`}
      >
        <img
          src="/lanterne/lanterna-dx.png"
          alt=""
          className={styles.lanternImg}
        />
      </div>

      {/* 3. LANTERNA SOTTO LEFT */}
      <div
        ref={lanternBottomLeftRef}
        className={`${styles.lanternWrapper} ${styles.lanternBottomLeft}`}
      >
        <img
          src="/lanterne/lanterna-sotto-sx.png"
          alt=""
          className={styles.lanternImg}
        />
      </div>

      {/* 4. LANTERNA SOTTO RIGHT */}
      <div
        ref={lanternBottomRightRef}
        className={`${styles.lanternWrapper} ${styles.lanternBottomRight}`}
      >
        <img
          src="/lanterne/lanterna-sotto-dx.png"
          alt=""
          className={styles.lanternImg}
        />
      </div>
    </div>
  );
}
