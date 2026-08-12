import styles from "./FaqDivider.module.css";

export default function FaqDivider() {
  return (
    <div className={styles.faqDivider} aria-hidden="true">
      <img
        src="/divisore-faq.png"
        alt=""
      />
    </div>
  );
}
