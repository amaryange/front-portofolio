import { loadPortfolioData } from "./actions";
import PortfolioTabs from "@/components/admin/portfolio/PortfolioTabs";

export default async function PortfolioPage() {
  const data = await loadPortfolioData();
  return <PortfolioTabs initial={data} />;
}
