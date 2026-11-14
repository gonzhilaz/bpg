import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { FeeCalculator } from "../components/landing/FeeCalculator";
import { FeaturesBento } from "../components/landing/FeaturesBento";
import { CodeShowcase } from "../components/landing/CodeShowcase";
import { ComparisonTable } from "../components/landing/ComparisonTable";
import { Footer } from "../components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080B10] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeeCalculator />
        <FeaturesBento />
        <CodeShowcase />
        <ComparisonTable />
      </main>
      <Footer />
    </div>
  );
}
