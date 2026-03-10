import dynamic from "next/dynamic";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import NewTours from "@/components/home/NewTours";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";

const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  ssr: false,
  loading: () => (
    <section className="h-screen" style={{ backgroundColor: "#0C1719" }} />
  ),
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedArtists />
      <NewTours />
      <HowItWorksSteps />
      <HowItWorks />
      <CTASection />
    </>
  );
}
