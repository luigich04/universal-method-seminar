"use client";

import { useEffect, useRef, useState } from "react";
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

  // Interactive Debug positioning state (hidden by default)
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState({
    topLeft: { top: 10.8, left: 29.8, width: 2.4 },
    topRight: { top: 11.6, left: 67.7, width: 2.4 },
    bottomLeft: { top: 27.2, left: 12.8, width: 3.2 },
    bottomRight: { top: 27.4, left: 84.3, width: 3.2 },
  });

  // Draggable window state
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; initialLeft: number; initialTop: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    const panelEl = (e.currentTarget.parentElement as HTMLElement);
    if (!panelEl) return;
    const rect = panelEl.getBoundingClientRect();

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    setPanelPos({
      left: Math.max(10, Math.min(window.innerWidth - 200, dragRef.current.initialLeft + deltaX)),
      top: Math.max(10, Math.min(window.innerHeight - 100, dragRef.current.initialTop + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.isDragging) {
      dragRef.current.isDragging = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const updateVal = (
    key: "topLeft" | "topRight" | "bottomLeft" | "bottomRight",
    field: "top" | "left" | "width",
    val: number
  ) => {
    setPos((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: parseFloat(val.toFixed(2)),
      },
    }));
  };

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

  const cssSnippet = `/* Posizionamento Lanterne Tempio */
.lanternTopLeft     { top: ${pos.topLeft.top}%; left: ${pos.topLeft.left}%; width: ${pos.topLeft.width}%; }
.lanternTopRight    { top: ${pos.topRight.top}%; left: ${pos.topRight.left}%; width: ${pos.topRight.width}%; }
.lanternBottomLeft  { top: ${pos.bottomLeft.top}%; left: ${pos.bottomLeft.left}%; width: ${pos.bottomLeft.width}%; }
.lanternBottomRight { top: ${pos.bottomRight.top}%; left: ${pos.bottomRight.left}%; width: ${pos.bottomRight.width}%; }`;

  const copyCss = () => {
    navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        className={`${styles.lanternWrapper}`}
        style={{
          top: `${pos.topLeft.top}%`,
          left: `${pos.topLeft.left}%`,
          width: `${pos.topLeft.width}%`,
        }}
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
        className={`${styles.lanternWrapper}`}
        style={{
          top: `${pos.topRight.top}%`,
          left: `${pos.topRight.left}%`,
          width: `${pos.topRight.width}%`,
        }}
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
        className={`${styles.lanternWrapper}`}
        style={{
          top: `${pos.bottomLeft.top}%`,
          left: `${pos.bottomLeft.left}%`,
          width: `${pos.bottomLeft.width}%`,
        }}
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
        className={`${styles.lanternWrapper}`}
        style={{
          top: `${pos.bottomRight.top}%`,
          left: `${pos.bottomRight.left}%`,
          width: `${pos.bottomRight.width}%`,
        }}
      >
        <img
          src="/lanterne/lanterna-sotto-dx.png"
          alt=""
          className={styles.lanternImg}
        />
      </div>

      {/* ── DEBUG CONTROLS OVERLAY PANEL ── */}
      <div className={styles.debugToggleBar}>
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className={styles.debugToggleBtn}
        >
          {showDebug ? "❌ CHIUDI DEBUG LANTERNE" : "🛠️ DEBUG LANTERNE"}
        </button>
      </div>

      {showDebug && (
        <div
          className={styles.debugPanel}
          style={
            panelPos
              ? {
                  left: `${panelPos.left}px`,
                  top: `${panelPos.top}px`,
                  bottom: "auto",
                  right: "auto",
                }
              : {}
          }
        >
          <div
            className={styles.debugHeader}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: "grab", userSelect: "none" }}
            title="Clicca e trascina per spostare la finestra"
          >
            <span className={styles.debugTitle}>
              🖐️ TRASCINA · DEBUG LANTERNE
            </span>
            <button
              type="button"
              className={styles.debugCloseBtn}
              onClick={() => setShowDebug(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.debugGrid}>
            {/* 1. TOP LEFT */}
            <div className={styles.debugCard}>
              <div className={styles.debugCardTitle}>1. Top Left (lanterna-sx.png)</div>
              <label>Top (%): <span>{pos.topLeft.top}%</span></label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.1"
                value={pos.topLeft.top}
                onChange={(e) => updateVal("topLeft", "top", parseFloat(e.target.value))}
              />
              <label>Left (%): <span>{pos.topLeft.left}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={pos.topLeft.left}
                onChange={(e) => updateVal("topLeft", "left", parseFloat(e.target.value))}
              />
              <label>Width (%): <span>{pos.topLeft.width}%</span></label>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.1"
                value={pos.topLeft.width}
                onChange={(e) => updateVal("topLeft", "width", parseFloat(e.target.value))}
              />
            </div>

            {/* 2. TOP RIGHT */}
            <div className={styles.debugCard}>
              <div className={styles.debugCardTitle}>2. Top Right (lanterna-dx.png)</div>
              <label>Top (%): <span>{pos.topRight.top}%</span></label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.1"
                value={pos.topRight.top}
                onChange={(e) => updateVal("topRight", "top", parseFloat(e.target.value))}
              />
              <label>Left (%): <span>{pos.topRight.left}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={pos.topRight.left}
                onChange={(e) => updateVal("topRight", "left", parseFloat(e.target.value))}
              />
              <label>Width (%): <span>{pos.topRight.width}%</span></label>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.1"
                value={pos.topRight.width}
                onChange={(e) => updateVal("topRight", "width", parseFloat(e.target.value))}
              />
            </div>

            {/* 3. BOTTOM LEFT */}
            <div className={styles.debugCard}>
              <div className={styles.debugCardTitle}>3. Bottom Left (lanterna-sotto-sx.png)</div>
              <label>Top (%): <span>{pos.bottomLeft.top}%</span></label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.1"
                value={pos.bottomLeft.top}
                onChange={(e) => updateVal("bottomLeft", "top", parseFloat(e.target.value))}
              />
              <label>Left (%): <span>{pos.bottomLeft.left}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={pos.bottomLeft.left}
                onChange={(e) => updateVal("bottomLeft", "left", parseFloat(e.target.value))}
              />
              <label>Width (%): <span>{pos.bottomLeft.width}%</span></label>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.1"
                value={pos.bottomLeft.width}
                onChange={(e) => updateVal("bottomLeft", "width", parseFloat(e.target.value))}
              />
            </div>

            {/* 4. BOTTOM RIGHT */}
            <div className={styles.debugCard}>
              <div className={styles.debugCardTitle}>4. Bottom Right (lanterna-sotto-dx.png)</div>
              <label>Top (%): <span>{pos.bottomRight.top}%</span></label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.1"
                value={pos.bottomRight.top}
                onChange={(e) => updateVal("bottomRight", "top", parseFloat(e.target.value))}
              />
              <label>Left (%): <span>{pos.bottomRight.left}%</span></label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={pos.bottomRight.left}
                onChange={(e) => updateVal("bottomRight", "left", parseFloat(e.target.value))}
              />
              <label>Width (%): <span>{pos.bottomRight.width}%</span></label>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.1"
                value={pos.bottomRight.width}
                onChange={(e) => updateVal("bottomRight", "width", parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.cssOutputContainer}>
            <pre className={styles.cssSnippet}>{cssSnippet}</pre>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={copyCss}
            >
              {copied ? "✓ COPIATO NEGLI APPUNTI!" : "📋 COPIA VALORI CSS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
