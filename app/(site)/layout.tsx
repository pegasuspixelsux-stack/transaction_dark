import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { montserrat, playfair } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Transaction",
  description: "Propiedades de autor frente al mar en Punta del Este.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-UY"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
