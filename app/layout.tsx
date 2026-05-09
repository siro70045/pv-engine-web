import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meridiana — fotovoltaico verificabile",
  description:
    "Strumento tecnico-economico per valutare il fotovoltaico in Italia, costruito su dati pubblici e modelli fisici verificabili.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full bg-meridiana-cream text-meridiana-black">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
