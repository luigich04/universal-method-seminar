"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Hero.module.css";

const OUTFITS = [
  { src: "/outfit0.png", alt: "Chris Collins - Martial Arts" },
  { src: "/outfit1.png", alt: "Chris Collins - MMA Training" },
  { src: "/outfit2.png", alt: "Chris Collins - Wing Tsun" },
  { src: "/outfit3.png", alt: "Chris Collins - BJJ Gi" },
];

interface HeroProps {
  onOpenReservation?: () => void;
}

export default function Hero({ onOpenReservation }: HeroProps) {
  const { dict } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenReservation) onOpenReservation();
  };

  // Outfit switcher loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % OUTFITS.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // GSAP Ultra-Smooth Mouse Parallax
  useEffect(() => {
    if (!heroRef.current) return;

    const hero = heroRef.current;
    const nameRow = hero.querySelector(`.${styles.nameRow}`);
    const heroInfoBar = hero.querySelector(`.${styles.heroInfoBar}`);

    if (!nameRow || !heroInfoBar) return;

    // High-performance GSAP quickTo interpolators for silky smooth movement on background & info text
    const xName = gsap.quickTo(nameRow, "x", { duration: 0.9, ease: "power3.out" });
    const yName = gsap.quickTo(nameRow, "y", { duration: 0.9, ease: "power3.out" });

    const xInfo = gsap.quickTo(heroInfoBar, "x", { duration: 1.0, ease: "power3.out" });
    const yInfo = gsap.quickTo(heroInfoBar, "y", { duration: 1.0, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;

      xName(-x * 32);
      yName(-y * 20);

      xInfo(-x * 16);
      yInfo(-y * 10);
    };

    const handleMouseLeave = () => {
      xName(0);
      yName(0);
      xInfo(0);
      yInfo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      {/* SVG filter for concrete/distressed text */}
      <svg className={styles.svgDefs} aria-hidden="true">
        <defs>
          <filter
            id="grunge"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.3 0.22"
              numOctaves="4"
              seed="5"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="grayNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="grayNoise"
              mode="multiply"
              result="textured"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -8 0 0 0 7"
              result="erosionMask"
            />
            <feComposite operator="in" in="textured" in2="erosionMask" />
          </filter>
        </defs>
      </svg>

      {/* Subtle warm gold accent light behind subject */}
      <div className={styles.heroLight} aria-hidden="true" />

      {/* Directional text overlay gradient */}
      <div className={styles.textOverlay} aria-hidden="true" />

      {/* Film grain overlay */}
      <div className={styles.grain} aria-hidden="true" />

      {/* Soft vignette */}
      <div className={styles.vignette} aria-hidden="true" />

      {/* Eye catchlight overlay */}
      <div className={styles.eyeCatchlight} aria-hidden="true" />

      {/* ── Layer 0: Logo watermark filigrana ── */}
      <div className={styles.watermark} aria-hidden="true">
        <Image
          src="/logo.png?v=2"
          alt=""
          width={800}
          height={800}
          className={styles.watermarkImg}
          unoptimized
        />
      </div>

      {/* ── Layer 1: Title "CHRIS COLLINS" with GSAP Parallax ── */}
      <div className={styles.nameRow} aria-label="Chris Collins">
        <span className={styles.nameLeft}>CHRIS</span>
        <span className={styles.nameRight}>COLLINS</span>
      </div>

      {/* ── Layer 2: Person photo switching outfits with GSAP Counter Parallax ── */}
      <div className={styles.photoWrap}>
        {OUTFITS.map((outfit, index) => (
          <Image
            key={outfit.src}
            src={outfit.src}
            alt={outfit.alt}
            fill
            priority
            unoptimized
            className={`${styles.photo} ${
              index === currentIndex ? styles.photoActive : styles.photoHidden
            }`}
            sizes="100vw"
          />
        ))}
        {/* Eye catchlight for mobile to subtly illuminate eyes */}
        <div className={styles.eyeCatchlight} aria-hidden="true" />
      </div>

      {/* ── Mobile-only: fade at bottom of photo ── */}
      <div className={styles.mobilePhotoFade} aria-hidden="true" />

      {/* ── Layer 3: Symmetrical Event Info Blocks with GSAP Parallax ── */}
      <div className={styles.heroInfoBar}>
        {/* Left Info: Location & Country */}
        <div className={styles.infoLeft}>
          <h3 className={styles.locCity}>{dict.hero.city}</h3>
          <div className={styles.locCountry}>{dict.hero.country}</div>
          <div className={styles.flagLine} aria-hidden="true" />
        </div>

        {/* Right Info: Schedule & Program */}
        <div className={styles.infoRight}>
          <div className={styles.dayCol}>
            <span className={styles.dayNumber}>{dict.hero.day1.number}</span>
            <span className={styles.dayMonth}>{dict.hero.day1.month}</span>
            <span className={styles.dayHours}>{dict.hero.day1.timeFrom}</span>
            <span className={styles.dayHours}>{dict.hero.day1.timeTo}</span>
          </div>

          <span className={styles.dayDot} aria-hidden="true" />

          <div className={styles.dayCol}>
            <span className={styles.dayNumber}>{dict.hero.day2.number}</span>
            <span className={styles.dayMonth}>{dict.hero.day2.month}</span>
            <span className={styles.dayHours}>{dict.hero.day2.timeFrom}</span>
            <span className={styles.dayHours}>{dict.hero.day2.timeTo}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom fade: transizione verso sezione nera ── */}
      <div className={styles.bottomFade} aria-hidden="true" />

      {/* ── CTA Hero — posizionato in basso ── */}
      <div className={styles.heroCta}>
        <a href="#reserve" onClick={handleCtaClick} className={styles.heroCtaBtn} id="hero-reserve-place">
          {dict.hero.reservePlace}
        </a>
        <p className={styles.heroCtaMicro}>
          <span className={styles.heroCtaMicroGold}>{dict.hero.limitedPlaces}</span>
          {` · ${dict.hero.audienceNote}`}
        </p>
      </div>

      {/* ── Mobile-only Text Block ── */}
      <div className={styles.mobileTextBlock}>
        {/* Group name and event info for tighter spacing */}
        <div className={styles.mobileHeaderGroup}>
          {/* Name block */}
          <div className={styles.mobileNameBlock}>
            <div className={styles.mobileChrisLabel}>CHRIS</div>
            <div className={styles.mobileCollins}>COLLINS</div>
          </div>

          {/* Event info */}
          <div className={styles.mobileEventInfo}>
            <div className={styles.mobileEventTitle}>{dict.hero.mobileTitle}</div>
            <div className={styles.mobileEventDetails}>{dict.hero.mobileDetails}</div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.mobileCta}>
          <a href="#reserve" onClick={handleCtaClick} className={styles.mobileCtaBtn} id="mobile-hero-reserve-place">
            {dict.hero.reservePlace}
          </a>
          <p className={styles.mobileCtaMicro}>
            <span className={styles.mobileCtaMicroGold}>{dict.hero.limitedPlaces.toUpperCase()}</span>
            <span className={styles.audienceNote}>{dict.hero.audienceNote}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
