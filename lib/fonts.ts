import { Inter, Playfair_Display, Montserrat } from "next/font/google";

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

/** Dashboard headings. The opsz axis (14–32) at 32 is the Inter Display cut. */
export const interDisplay = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});
