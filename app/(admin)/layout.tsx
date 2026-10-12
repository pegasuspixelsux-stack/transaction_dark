import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminProvider } from "@/lib/admin/admin-context";
import { montserrat, playfair } from "@/lib/fonts";
import "./admin.css";

export const metadata: Metadata = {
  title: "Transaction · Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es-UY"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
