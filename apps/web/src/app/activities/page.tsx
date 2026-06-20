import { ActivitiesList } from "@/components/activities/ActivitiesList";
import { HomeRulesBanner } from "@/components/home/HomeRulesBanner";

export default function ActivitiesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <HomeRulesBanner />
      <ActivitiesList />
    </div>
  );
}
