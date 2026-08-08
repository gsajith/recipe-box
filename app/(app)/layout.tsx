import { AppHeader } from "@/components/AppHeader";
import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <AppHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
