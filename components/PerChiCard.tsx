import Image from "next/image";
import Link from "next/link";

interface PerChiCardProps {
  numero: "1" | "2" | "3";
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
  numero,
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
          {/* Decorative serif numeral, watermark behind the illustration */}
          <span
            aria-hidden="true"
            className={`pointer-events-none select-none absolute top-1/2 -translate-y-1/2 z-0 font-serif leading-none text-meridiana-yellow opacity-15 transition-opacity duration-500 ease-out group-hover:opacity-25 text-[9rem] sm:text-[11rem] lg:text-[14rem] ${
              illoLeft
                ? "left-0 -translate-x-2 lg:-translate-x-8"
                : "right-0 translate-x-2 lg:translate-x-8"
            }`}
          >
            {numero}
          </span>

          {/* Illustration — transparent PNG, never cropped (object-contain) */}
          <div className="relative z-10 aspect-[1382/752]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-contain transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:saturate-[1.15]"
            />
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
