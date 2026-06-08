import type { Metadata } from "next";
import InArrivoPlaceholder from "@/components/InArrivoPlaceholder";

export const metadata: Metadata = {
  title: "Meridiana — Casa",
  description:
    "La sezione dedicata al fotovoltaico residenziale arriverà nell'inverno 2026.",
};

export default function CasaPage() {
  return (
    <InArrivoPlaceholder
      titolo="Inverno 2026"
      descrizione="La sezione dedicata al fotovoltaico residenziale arriverà presto. Nel frattempo, scopri Meridiana per le scuole italiane."
    />
  );
}
