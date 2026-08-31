import { OceanusHero } from "@/components/OceanusHero";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Zones } from "@/components/Zones";
import { BrandStatement } from "@/components/BrandStatement";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <OceanusHero />
      <BrandStatement />
      <FeaturedProperties />
      <Zones />
      <Contact />
      <SiteFooter />
    </>
  );
}
