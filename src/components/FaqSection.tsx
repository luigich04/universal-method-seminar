"use client";

import React, { useState } from "react";
import styles from "./FaqSection.module.css";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Who is this seminar for?",
    answer:
      "This seminar is open to all martial artists, practitioners, and enthusiasts of any discipline (BJJ, Wing Tsun, MMA, Kali, Karate, Boxing) looking to elevate their understanding of movement, timing, and combat strategy.",
  },
  {
    question: "Do I need previous martial arts experience?",
    answer:
      "All skill levels are welcome, from complete beginners to advanced practitioners and black belts. Chris Collins adapts instruction to help everyone progress at their personal level.",
  },
  {
    question: "What should I bring?",
    answer:
      "Wear comfortable training clothing (Gi or No-Gi / t-shirt and athletic pants), bring a water bottle, a small towel, and your digital ticket pass (QR code) on your phone or printed.",
  },
  {
    question: "Where will the seminar take place?",
    answer:
      "The seminar takes place in Bracciano (Rome), Italy on September 7 and 8, 2026. Exact venue address, directions, and local accommodation recommendations will be sent to your email upon reservation.",
  },
  {
    question: "How do I reserve my place?",
    answer:
      "Click the 'RESERVE YOUR PASS' button anywhere on the website, select your pass option (Full 2-Day or Single Day), complete your details and proceed to secure checkout.",
  },
  {
    question: "Are places limited?",
    answer:
      "Yes, capacity is strictly capped at 30 participants to ensure high-quality, personalized instruction and direct individual feedback from Chris Collins.",
  },
  {
    question: "Can I attend only one day?",
    answer:
      "Yes! We offer single-day passes for Day 1 (Perceive and Intercept) or Day 2 (Adapt and Overcome), as well as the discounted Full 2-Day Bundle.",
  },
];

interface FaqSectionProps {
  onOpenReservation?: () => void;
}

export default function FaqSection({ onOpenReservation }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section} id="faq">
      <div className={styles.inner}>
        {/* Left Column: Heading & Description */}
        <div className={styles.leftCol}>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.headline}>
            FREQUENTLY ASKED
            <br />
            QUESTIONS
          </h2>
          <p className={styles.subtitle}>
            Everything you need to know before reserving your place.
          </p>
        </div>

        {/* Right Column: Interactive Accordion */}
        <div className={styles.rightCol}>
          <div className={styles.accordionList}>
            {faqData.map((item, idx) => {
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
