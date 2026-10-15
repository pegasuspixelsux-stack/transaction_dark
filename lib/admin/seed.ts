import type { DbState, Lead } from "@/types/admin";

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};


const seedLeads: Lead[] = [
  { id: "l-01", name: "Camila Torres", phone: "+598 99 123 456", email: "camila@example.com", propertyId: "ji-01", propertyTitle: "Casa de las Dunas", assignedAgentId: null, stage: "new", outcome: null, source: "Formulario de contacto", createdAt: daysAgo(0, 9) },
  { id: "l-02", name: "Andrew Wallace", phone: "+1 305 555 0142", email: "andrew@example.com", propertyId: "mn-03", propertyTitle: "Penthouse Bikini", assignedAgentId: null, stage: "new", outcome: null, source: "Concierge A-Gente", createdAt: daysAgo(1, 14) },
  { id: "l-03", name: "Juliana Moreira", phone: "+55 11 98888 7766", email: "juliana@example.com", propertyId: "lb-02", propertyTitle: "Casa Galería", assignedAgentId: null, stage: "contacted", outcome: null, source: "Formulario de contacto", createdAt: daysAgo(3) },
  { id: "l-04", name: "Ricardo Benítez", phone: "+598 94 555 210", email: "ricardo@example.com", propertyId: "ji-03", propertyTitle: "Casa Faro Norte", assignedAgentId: null, stage: "contacted", outcome: null, source: "Referido", createdAt: daysAgo(5) },
  { id: "l-05", name: "Hannah Becker", phone: "+49 151 2345 6789", email: "hannah@example.com", propertyId: "ji-02", propertyTitle: "Estancia del Este", assignedAgentId: null, stage: "viewing", outcome: null, source: "Formulario de contacto", createdAt: daysAgo(8) },
  { id: "l-06", name: "Tomás Gil", phone: "+54 11 4567 8901", email: "tomas@example.com", propertyId: "pe-02", propertyTitle: "Apartamento Torre Mar", assignedAgentId: null, stage: "viewing", outcome: null, source: "Concierge A-Gente", createdAt: daysAgo(10) },
  { id: "l-07", name: "Elena Rossi", phone: "+39 333 123 4567", email: "elena@example.com", propertyId: "mn-02", propertyTitle: "Casa Médano", assignedAgentId: null, stage: "negotiation", outcome: null, source: "Referido", createdAt: daysAgo(14) },
  { id: "l-08", name: "Pablo Giménez", phone: "+598 98 777 321", email: "pablo@example.com", propertyId: "ma-01", propertyTitle: "Apartamento Brava", assignedAgentId: null, stage: "closed", outcome: "won", source: "Formulario de contacto", createdAt: daysAgo(30) },
  { id: "l-09", name: "Nora Whitfield", phone: "+44 7700 900123", email: "nora@example.com", propertyId: "lb-01", propertyTitle: "Penthouse del Arroyo", assignedAgentId: null, stage: "closed", outcome: "lost", source: "Concierge A-Gente", createdAt: daysAgo(35) },
];

export function createSeed(): DbState {
  return {
    leads: structuredClone(seedLeads),
  };
}
