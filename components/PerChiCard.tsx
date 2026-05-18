import Image from "next/image";
import Link from "next/link";
import styles from "./PerChiCard.module.css";

interface PerChiCardProps {
  stato: string;
  statoTipo: "attivo" | "arrivo";
  titolo: string;
  corpo: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  orientamento: "illo-left" | "illo-right";
}

export default function PerChiCard({
  stato,
  statoTipo,
  titolo,
  corpo,
  imageSrc,
  imageAlt,
  href,
  orientamento,
}: PerChiCardProps) {
  const illoLeft = orientamento === "illo-left";

  return (
    <Link href={href} className="group block py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Image column — first in DOM so it sits above the text on mobile/tablet */}
        <div
          className={`relative ${
            illoLeft ? "lg:order-1" : "lg:order-2"
          }`}
        >
          {/* Illustration — transparent PNG, never cropped (object-contain).
              On hover it lifts off the cream: scale + saturation + a soft,
              silhouette-following drop-shadow (filter, not box-shadow, so it
              respects the PNG alpha). drop-shadow is applied via the Tailwind
              utility so it composes with saturate in the same filter chain.

              The light scroll parallax (translateY) lives on the OUTER
              styles.parallax wrapper, deliberately a different element from
              the <Image> that carries the hover transforms — so the browser
              never composes the scroll translate and the hover scale on the
              same node. See PerChiCard.module.css for the technique and the
              graceful fallback. */}
          <div className={styles.parallax}>
            <div className="relative z-10 aspect-[1382/752]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-contain transition-all duration-700 ease-out group-hover:scale-[1.07] group-hover:saturate-[1.25] group-hover:drop-shadow-[0_28px_42px_rgba(0,0,0,0.22)]"
              />
            </div>
          </div>
        </div>

        {/* Text column */}
        <div
          className={`mt-8 lg:mt-0 ${
            illoLeft ? "lg:order-2" : "lg:order-1"
          }`}
        >
          {/* Status pill */}
          <p
            className={`text-meridiana-yellow font-bold text-sm mb-4 ${
              statoTipo === "arrivo" ? "uppercase tracking-[0.15em]" : ""
            }`}
          >
            {stato}
          </p>

          {/* Title */}
          <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-meridiana-black leading-tight mb-6">
            {titolo}
          </h3>

          {/* Body */}
          <p className="text-base lg:text-lg text-meridiana-text-secondary leading-relaxed max-w-prose text-left">
            {corpo}
          </p>
        </div>
      </div>
    </Link>
  );
}
