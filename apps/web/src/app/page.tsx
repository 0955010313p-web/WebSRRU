import { HomeFeaturedCarousel } from "@/components/home/HomeFeaturedCarousel";
import { HomeQuickSections } from "@/components/home/HomeQuickSections";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col justify-center gap-6">
      <HomeFeaturedCarousel />
      <HomeQuickSections />
    </div>
  );
}
