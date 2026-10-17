import { TransactionHero } from "@/components/TransactionHero";
import { ValuePropositions } from "@/components/ValuePropositions";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { Zones } from "@/components/Zones";
import { BrandStatement } from "@/components/BrandStatement";
import { Team } from "@/components/Team";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";
import { isAgentEnabled } from "@/lib/site-config";
import { getSiteConfig, waNumber } from "@/lib/server/public-config";
import { getPublicProperties, pickHero } from "@/lib/server/public-properties";

export default async function Home() {
  const config = await getSiteConfig();
  const heroProperties = pickHero(await getPublicProperties());
  return (
    <>
      <TransactionHero properties={heroProperties} />
      <ValuePropositions />
      <BrandStatement />
      <FeaturedProperties />
      <Zones />
      <Team />
      <Contact />
      <SiteFooter />
      {isAgentEnabled(config) ? (
        <AGenteConcierge whatsapp={waNumber(config.whatsapp.primary.number)} />
      ) : null}
    </>
  );
}
