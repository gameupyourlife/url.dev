import { getDailyClicks } from "@/app/actions/analytics";
import { TrafficChart } from "@/components/dashboard/TrafficChart";

export default async function UrlTraffic({ urlId, days = 90 }: { urlId: string; days?: number }) {
    const data = await getDailyClicks({ urlId, days });
    return <TrafficChart data={data} />;
}
