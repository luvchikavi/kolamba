import HeroSection from "@/components/home/HeroSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import NewTours from "@/components/home/NewTours";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedArtists />
      <NewTours />
      <CategoriesSection />
      <HowItWorksSteps />
      <HowItWorks />
      <CTASection />
    </>
  );
}
