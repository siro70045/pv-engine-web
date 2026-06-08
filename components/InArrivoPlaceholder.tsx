interface InArrivoPlaceholderProps {
  titolo: string; // launch season, e.g. "Inverno 2026"
  descrizione: string; // short editorial line shown below the title
}

// Reusable "coming soon" placeholder for sections that aren't built yet
// (/casa, /aziende, future ones). Renders a deliberately empty, centered
// block — reads as intentional, not unfinished. Navbar/Footer come from
// app/layout.tsx, which already wraps page content in <main className="min-h-screen">,
// so this is a <section> (no nested <main>). Navbar is h-16 (4rem); we
// subtract it to center within the remaining viewport. Eyebrow matches the
// "in arrivo" status style used in PerChiCard for a consistent visual voice.
export default function InArrivoPlaceholder({
  titolo,
  descrizione,
}: InArrivoPlaceholderProps) {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-2xl">
        <p className="text-meridiana-yellow font-bold text-sm uppercase tracking-[0.15em] mb-6">
          In arrivo
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-meridiana-black mb-8">
          {titolo}
        </h1>
        <p className="text-meridiana-text-secondary text-lg leading-relaxed">
          {descrizione}
        </p>
      </div>
    </section>
  );
}
