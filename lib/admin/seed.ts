import { properties as publicProperties } from "@/lib/properties";
import type { AdminProperty, AdminUser, DbState, Lead } from "@/types/admin";

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/** Demo password for every seeded account. Mock auth only. */
export const DEMO_PASSWORD = "demo1234";

const seedUsers: AdminUser[] = [
  { id: "u-admin", fullName: "Sofía Alvarez", email: "admin@transaction.demo", password: DEMO_PASSWORD, role: "admin", active: true, lastLogin: daysAgo(0, 8) },
  { id: "u-manager", fullName: "Martín Pereyra", email: "manager@transaction.demo", password: DEMO_PASSWORD, role: "manager", active: true, lastLogin: daysAgo(1, 17) },
  { id: "u-agent-1", fullName: "Lucía Fernández", email: "agent@transaction.demo", password: DEMO_PASSWORD, role: "agent", active: true, lastLogin: daysAgo(0, 9) },
  { id: "u-agent-2", fullName: "Diego Castro", email: "diego@transaction.demo", password: DEMO_PASSWORD, role: "agent", active: true, lastLogin: daysAgo(3, 12) },
  { id: "u-agent-3", fullName: "Valentina Ríos", email: "valentina@transaction.demo", password: DEMO_PASSWORD, role: "agent", active: false, lastLogin: daysAgo(40, 15) },
];

const agentIds = ["u-agent-1", "u-agent-2"];

const seedProperties: AdminProperty[] = publicProperties.map((p, i) => ({
  id: p.id,
  title: p.title,
  listingType: p.price < 800000 && i % 2 === 0 ? "rent" : "sale",
  price: p.price,
  currency: "USD",
  location: `${p.zone}, Maldonado`,
  bedrooms: p.bedrooms,
  bathrooms: p.bathrooms ?? Math.max(1, p.bedrooms - 1),
  areaM2: p.area ?? 120 + p.bedrooms * 60,
  features: p.features ?? [],
  imageUrl: p.imageUrl,
  description: p.description ?? "",
  status: i % 5 === 4 ? "draft" : "published",
  assignedAgentId: agentIds[i % agentIds.length],
  updatedAt: daysAgo(i),
}));

const seedLeads: Lead[] = [
  { id: "l-01", name: "Camila Torres", phone: "+598 99 123 456", email: "camila@example.com", propertyId: "ji-01", propertyTitle: "Casa de las Dunas", assignedAgentId: null, stage: "new", outcome: null, source: "Contact form", createdAt: daysAgo(0, 9) },
  { id: "l-02", name: "Andrew Wallace", phone: "+1 305 555 0142", email: "andrew@example.com", propertyId: "mn-03", propertyTitle: "Penthouse Bikini", assignedAgentId: null, stage: "new", outcome: null, source: "A-Gente concierge", createdAt: daysAgo(1, 14) },
  { id: "l-03", name: "Juliana Moreira", phone: "+55 11 98888 7766", email: "juliana@example.com", propertyId: "lb-02", propertyTitle: "Casa Galería", assignedAgentId: "u-agent-1", stage: "contacted", outcome: null, source: "Contact form", createdAt: daysAgo(3) },
  { id: "l-04", name: "Ricardo Benítez", phone: "+598 94 555 210", email: "ricardo@example.com", propertyId: "ji-03", propertyTitle: "Casa Faro Norte", assignedAgentId: "u-agent-2", stage: "contacted", outcome: null, source: "Referral", createdAt: daysAgo(5) },
  { id: "l-05", name: "Hannah Becker", phone: "+49 151 2345 6789", email: "hannah@example.com", propertyId: "ji-02", propertyTitle: "Estancia del Este", assignedAgentId: "u-agent-1", stage: "viewing", outcome: null, source: "Contact form", createdAt: daysAgo(8) },
  { id: "l-06", name: "Tomás Gil", phone: "+54 11 4567 8901", email: "tomas@example.com", propertyId: "pe-02", propertyTitle: "Apartamento Torre Mar", assignedAgentId: "u-agent-2", stage: "viewing", outcome: null, source: "A-Gente concierge", createdAt: daysAgo(10) },
  { id: "l-07", name: "Elena Rossi", phone: "+39 333 123 4567", email: "elena@example.com", propertyId: "mn-02", propertyTitle: "Casa Médano", assignedAgentId: "u-agent-1", stage: "negotiation", outcome: null, source: "Referral", createdAt: daysAgo(14) },
  { id: "l-08", name: "Pablo Giménez", phone: "+598 98 777 321", email: "pablo@example.com", propertyId: "ma-01", propertyTitle: "Apartamento Brava", assignedAgentId: "u-agent-2", stage: "closed", outcome: "won", source: "Contact form", createdAt: daysAgo(30) },
  { id: "l-09", name: "Nora Whitfield", phone: "+44 7700 900123", email: "nora@example.com", propertyId: "lb-01", propertyTitle: "Penthouse del Arroyo", assignedAgentId: "u-agent-1", stage: "closed", outcome: "lost", source: "A-Gente concierge", createdAt: daysAgo(35) },
];

export function createSeed(): DbState {
  return {
    users: structuredClone(seedUsers),
    properties: structuredClone(seedProperties),
    leads: structuredClone(seedLeads),
  };
}
