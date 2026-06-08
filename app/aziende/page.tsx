import type { Metadata } from "next";
import InArrivoPlaceholder from "@/components/InArrivoPlaceholder";

export const metadata: Metadata = {
  title: "Meridiana — Aziende",
  description:
    "La sezione dedicata al fotovoltaico industriale e commerciale arriverà nella primavera 2027.",
};

export default function AziendePage() {
  return (
    <InArrivoPlaceholder
      titolo="Primavera 2027"
      descrizione="La sezione dedicata al fotovoltaico industriale e commerciale arriverà presto. Nel frattempo, scopri Meridiana per le scuole italiane."
    />
  );
}
