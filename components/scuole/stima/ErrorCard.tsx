"use client";

// Error surface — earthy Meridiana red, sober tone, single retry action.

export default function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.06)] p-8 border-l-4 border-meridiana-red"
    >
      <h2 className="font-sans text-base font-semibold text-meridiana-red">
        Qualcosa non ha funzionato
      </h2>
      <p className="font-sans text-sm text-meridiana-text-secondary mt-2 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 px-6 rounded-full font-sans text-sm font-semibold bg-meridiana-cream-light border border-meridiana-border-medium text-meridiana-black transition-all duration-200 ease-out active:scale-[0.98] hover:border-meridiana-black motion-reduce:transition-none motion-reduce:active:scale-100 cursor-pointer"
      >
        Riprova
      </button>
    </div>
  );
}
