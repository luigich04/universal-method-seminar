import styles from "./BrushDivider.module.css";

export default function BrushDivider() {
  return (
    <div className={styles.brushDivider} aria-hidden="true">
      <img
        src="/pennellata_marziale.png"
        alt=""
      />
    </div>
  );
}
