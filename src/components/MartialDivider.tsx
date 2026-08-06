import styles from "./MartialDivider.module.css";

export default function MartialDivider() {
  return (
    <div className={styles.martialDivider} aria-hidden="true">
      <img
        src="/martial-divider-mask.png"
        alt=""
      />
    </div>
  );
}
