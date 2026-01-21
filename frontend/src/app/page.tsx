import HeroSection from "@/components/home/HeroSection";
import FeaturedArtists from "@/components/home/FeaturedArtists";
import HolidayRecommendations from "@/components/home/HolidayRecommendations";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedArtists />
      <HolidayRecommendations />
      <CategoriesSection />
      <HowItWorks />
      <CTASection />
    </>
  );
}
