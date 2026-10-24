import type { Metadata } from "next";
import { InvestmentSections } from "@/components/investments/InvestmentSections";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Inversiones · Transaction",
  description:
    "Transacciones inmobiliarias estratégicas y asesoramiento para inversores internacionales en la costa de Uruguay.",
};

export default function InversionesPage() {
  return (
    <>
      <main className="pt-16 sm:pt-20">
        <InvestmentSections />
      </main>
      <SiteFooter />
    </>
  );
}
