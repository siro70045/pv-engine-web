import HealthStatus from "@/components/HealthStatus";

export default function StatusPage() {
  return (
    <div className="container mx-auto px-6 py-24 max-w-3xl">
      <h1 className="text-4xl mb-8">Stato del sistema</h1>
      <p className="text-meridiana-text-secondary mb-8">
        Diagnostica live dell&apos;API Meridiana. Pagina interna per verifica funzionamento.
      </p>
      <HealthStatus />
    </div>
  );
}
