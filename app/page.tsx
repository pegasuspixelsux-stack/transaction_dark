import { OceanusHero } from "@/components/OceanusHero";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Zones } from "@/components/Zones";
import { BrandStatement } from "@/components/BrandStatement";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <OceanusHero />
      <FeaturedProperties />
      <Zones />
      <BrandStatement />
      <Contact />
    </>
  );
}
