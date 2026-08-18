"use client";

import Image from "next/image";
import styles from "./SponsorsMarquee.module.css";

const SPONSOR_LOGOS = [
  { src: "/sponsor/abbruzzi.png", alt: "Abbruzzi", width: 140, height: 60 },
  { src: "/sponsor/agora.png", alt: "Agorà", width: 140, height: 60 },
  { src: "/sponsor/Logo%20simone.png", alt: "Simone", width: 140, height: 60 },
  { src: "/sponsor/logo_garrison_black.png", alt: "Garrison", width: 140, height: 60 },
  { src: "/sponsor/Villa%20Sandra.png", alt: "Villa Sandra", width: 160, height: 60 },
];

export default function SponsorsMarquee() {
  // Duplicate for seamless 100% infinite marquee
  const marqueeItems = [
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
    ...SPONSOR_LOGOS,
  ];

  return (
    <section className={styles.marqueeSection} aria-label="Sponsors">
      <div className={styles.marqueeContainer}>
        <div className={styles.fadeLeft} aria-hidden="true" />
        <div className={styles.fadeRight} aria-hidden="true" />

        <div className={styles.marqueeTrack}>
          {marqueeItems.map((item, idx) => (
            <div key={`${item.alt}-${idx}`} className={styles.logoItem}>
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className={styles.sponsorLogo}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
