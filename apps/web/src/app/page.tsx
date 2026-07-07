import { HomeFeaturedCarousel } from "@/components/home/HomeFeaturedCarousel";
import { HomeQuickSections } from "@/components/home/HomeQuickSections";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <HomeFeaturedCarousel />
      <HomeQuickSections />
    </div>
  );
}
