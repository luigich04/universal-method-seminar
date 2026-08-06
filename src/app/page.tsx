import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SeminarSection from "@/components/SeminarSection";
import MartialDivider from "@/components/MartialDivider";
import MethodSection from "@/components/MethodSection";
import BrushDivider from "@/components/BrushDivider";
import ProgrammeSection from "@/components/ProgrammeSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      {/* <Loader /> */}
      <CustomCursor />
      <Navbar />
      <Hero />
      <div className={styles.seminarWrapper}>
        <SeminarSection />
        <MartialDivider />
      </div>
      <MethodSection />
      <BrushDivider />
      <ProgrammeSection />
    </main>
  );
}
