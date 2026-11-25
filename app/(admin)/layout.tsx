import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AdminProvider } from "@/lib/admin/admin-context";
import { interDisplay, montserrat, playfair } from "@/lib/fonts";
import { getSiteConfig } from "@/lib/server/public-config";
import { brandingMetadata } from "@/lib/server/site-metadata";
import "./admin.css";

/** Same favicon as the site; never indexed, so no share preview is needed. */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `${config.agency.name} · Admin`,
    robots: { index: false, follow: false },
    icons: brandingMetadata(config).icons,
  };
}

/** The dashboard is light-only: tells the browser not to apply OS dark mode to native controls. */
export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es-UY"
      className={`${playfair.variable} ${montserrat.variable} ${interDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
