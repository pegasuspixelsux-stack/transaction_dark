import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AdminProvider } from "@/lib/admin/admin-context";
import { interDisplay, montserrat, playfair } from "@/lib/fonts";
import "./admin.css";

export const metadata: Metadata = {
  title: "Transaction · Admin",
  robots: { index: false, follow: false },
};

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
