import { OceanusHero } from "@/components/OceanusHero";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Zones } from "@/components/Zones";
import { BrandStatement } from "@/components/BrandStatement";
import { Team } from "@/components/Team";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";

export default function Home() {
  return (
    <>
      <OceanusHero />
      <BrandStatement />
      <FeaturedProperties />
      <Zones />
      <Team />
      <Contact />
      <SiteFooter />
      <AGenteConcierge />
    </>
  );
}
