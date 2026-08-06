"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Nasconde il cursore nativo del browser
    document.body.classList.add("custom-cursor-active");

    const ring = ringRef.current;
    if (!ring) return;

    const xRing = gsap.quickTo(ring, "x", { duration: 0.09, ease: "power2.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.09, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    // Rileva hover su elementi interattivi
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, input, select, textarea, [role='button'], .interactive")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      style={{ opacity: isVisible ? 1 : 0 }}
      className={`${styles.cursorRing} ${
        isHovered ? styles.ringHover : ""
      } ${isClicked ? styles.ringClicked : ""}`}
    />
  );
}
