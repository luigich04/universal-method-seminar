"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./FaqSection.module.css";

interface FaqSectionProps {
  onOpenReservation?: () => void;
}

export default function FaqSection({ onOpenReservation }: FaqSectionProps) {
  const { dict } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = dict.faq.items;

  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        {/* Left Column: Heading & Description */}
        <div className={styles.leftCol}>
          <span className={styles.eyebrow}>{dict.faq.eyebrow}</span>
          <h2 className={styles.headline} style={{ whiteSpace: "pre-line" }}>
            {dict.faq.headline}
          </h2>
          <p className={styles.subtitle}>
            {dict.faq.subtitle}
          </p>
        </div>

        {/* Right Column: Interactive Accordion */}
        <div className={styles.rightCol}>
          <div className={styles.accordionList}>
            {faqData.map((item: { question: string; answer: string }, idx: number) => {
              const isOpen = openIndex === idx;
              const isCompressed = openIndex !== null && !isOpen;
              return (
                <div
                  key={idx}
                  className={`${styles.accordionItem} ${isOpen ? styles.open : ""} ${
                    isCompressed ? styles.compressed : ""
                  }`}
                >
                  <button
                    type="button"
                    className={styles.questionBtn}
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.questionText}>{item.question}</span>
                    <span className={styles.plusIcon}>+</span>
                  </button>

                  <div className={styles.answerBoxWrapper}>
                    <div className={styles.answerBoxInner}>
                      <p className={styles.answerText}>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
