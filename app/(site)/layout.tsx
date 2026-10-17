import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/theme-context";
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
      suppressHydrationWarning
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        {/* Dark by default; apply the saved choice before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink dark:bg-zinc-950 dark:text-white">
        <ThemeProvider>
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
