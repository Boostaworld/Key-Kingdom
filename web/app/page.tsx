// web/app/page.tsx

import { HomePageClient } from "@/components/HomePageClient";
import { loadProducts } from "@/data/products";

export default async function Home() {
  const products = await loadProducts();
  return <HomePageClient products={products} />;
}
