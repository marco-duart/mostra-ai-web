import { useParams } from "react-router-dom";
import { StoreCatalogView } from "@/components/store/StoreCatalogView";

export function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  return <StoreCatalogView slug={slug} />;
}
