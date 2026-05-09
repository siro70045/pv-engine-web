import Hero from "@/components/Hero";
import HealthStatus from "@/components/HealthStatus";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="container mx-auto px-6 py-12 max-w-3xl">
        <HealthStatus />
      </section>
    </>
  );
}
