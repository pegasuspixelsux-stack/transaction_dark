/**
 * Central business configuration. Edit values here and every consumer
 * (admin settings view, footers, contact widgets) picks them up.
 */
export const siteConfig = {
  agency: {
    name: "Transaction",
    tagline: "Propiedades de autor frente al mar en Punta del Este.",
    licenseId: "MVOTMA-REG-00000", // TODO: replace with the real registration ID
  },
  address: {
    street: "Av. Gorlero 000",
    city: "Punta del Este",
    region: "Maldonado",
    country: "Uruguay",
    postalCode: "20100",
    coordinates: { lat: -34.9667, lng: -54.95 },
  },
  contact: {
    phones: ["+598 42 000 000", "+598 42 000 001"],
    emails: ["hello@transaction.example", "sales@transaction.example"],
  },
  whatsapp: {
    primary: {
      number: "+59899000000",
      defaultMessage:
        "Hello! I'm interested in one of your properties and would like more information.",
    },
    support: { number: "+59899000001" },
  },
  hours: {
    weekday: "Mon – Fri · 09:00 – 18:00",
    saturday: "Sat · 10:00 – 14:00",
    sunday: "Sun · By appointment",
    holidays: "Public holidays · By appointment",
  },
  social: {
    instagram: "https://instagram.com/transaction",
    facebook: "https://facebook.com/transaction",
    linkedin: "https://linkedin.com/company/transaction",
    youtube: "https://youtube.com/@transaction",
  },
} as const;

export type SiteConfig = typeof siteConfig;
