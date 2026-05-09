export default function Footer() {
  return (
    <footer className="bg-meridiana-black text-meridiana-cream mt-32">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-serif text-xl mb-4">
              <span className="text-meridiana-yellow">☀</span>
              <span className="font-semibold">Meridiana</span>
            </div>
            <p className="text-sm text-meridiana-cream/60 leading-relaxed">
              Strumento tecnico-economico per il fotovoltaico in Italia.
            </p>
          </div>

          {/* Prodotto */}
          <div>
            <h4 className="font-serif text-sm font-semibold mb-4 text-meridiana-cream">
              Prodotto
            </h4>
            <ul className="space-y-2 text-sm text-meridiana-cream/60">
              <li><a href="/scuole" className="hover:text-meridiana-cream">Scuole</a></li>
              <li><a href="/casa" className="hover:text-meridiana-cream">Casa</a></li>
              <li><a href="/aziende" className="hover:text-meridiana-cream">Aziende</a></li>
              <li><a href="/simulatore" className="hover:text-meridiana-cream">Simulatore</a></li>
            </ul>
          </div>

          {/* Risorse */}
          <div>
            <h4 className="font-serif text-sm font-semibold mb-4 text-meridiana-cream">
              Risorse
            </h4>
            <ul className="space-y-2 text-sm text-meridiana-cream/60">
              <li><a href="/magazine" className="hover:text-meridiana-cream">Magazine</a></li>
              <li><a href="/metodologia" className="hover:text-meridiana-cream">Metodologia</a></li>
              <li><a href="/storia" className="hover:text-meridiana-cream">La storia</a></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h4 className="font-serif text-sm font-semibold mb-4 text-meridiana-cream">
              Contatti
            </h4>
            <ul className="space-y-2 text-sm text-meridiana-cream/60">
              <li>info@meridiana.it</li>
              <li>
                <span className="opacity-60">IT</span> ·
                <span className="opacity-30 ml-1">EN</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-meridiana-cream/10 flex flex-col md:flex-row justify-between text-xs text-meridiana-cream/40">
          <span>© 2026 Meridiana. Costruito in Italia.</span>
          <span>Versione di sviluppo</span>
        </div>
      </div>
    </footer>
  );
}
