import type { Metadata } from "next";
import HeroScuole from "@/components/scuole/HeroScuole";
import IntroScuole from "@/components/scuole/IntroScuole";
import ComeFunziona from "@/components/scuole/ComeFunziona";
import ProgrammaEducativo from "@/components/scuole/ProgrammaEducativo";
import CalibratoScuole from "@/components/scuole/CalibratoScuole";
import CtaStima from "@/components/scuole/CtaStima";

export const metadata: Metadata = {
  title: "Meridiana — Scuole",
  description:
    "Fotovoltaico per le scuole italiane. Numeri verificabili e un programma educativo per portare la sostenibilità nelle aule.",
};

export default function ScuolePage() {
  return (
    <>
      <HeroScuole />
      <IntroScuole />
      <ComeFunziona />
      <ProgrammaEducativo />
      <CalibratoScuole />
      <CtaStima />
    </>
  );
}
