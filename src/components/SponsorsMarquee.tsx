"use client";

import Image from "next/image";
import styles from "./SponsorsMarquee.module.css";

const SPONSOR_LOGOS = [
  { src: "/yim-logo-ticket.png", alt: "Yim Wing Tsun", width: 44, height: 44 },
  { src: "/logo-header.png", alt: "Universal Method", width: 44, height: 44 },
  { src: "/logo.png", alt: "UMS Emblem", width: 44, height: 44 },
  { src: "/logo-yim.png", alt: "Yim Emblem", width: 44, height: 44 },
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
