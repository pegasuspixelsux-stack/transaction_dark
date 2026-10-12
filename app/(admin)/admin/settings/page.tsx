import type { ReactNode } from "react";
import { siteConfig } from "@/config/siteConfig";
import { GlassCard, PageHeader } from "@/components/admin/ui";
import { whatsappLink } from "@/lib/admin/utils";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-xl font-normal tracking-tight">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm">{children}</dl>
    </GlassCard>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs uppercase tracking-luxury text-admin-ink">{label}</dt>
      <dd className="break-words text-admin-muted">{children}</dd>
    </div>
  );
}

const linkClass =
  "text-admin-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent";

export default function SettingsPage() {
  const { agency, address, contact, whatsapp, hours, social } = siteConfig;
  return (
    <div data-rise>
      <PageHeader eyebrow="Business" title="Site Configuration" />
      <p className="mb-6 max-w-prose text-sm text-admin-muted">
        These values come from <code className="text-admin-ink">config/siteConfig.ts</code>. Edit that
        file to update them everywhere they are used.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Agency">
          <Row label="Name">{agency.name}</Row>
          <Row label="Tagline">{agency.tagline}</Row>
          <Row label="License ID">{agency.licenseId}</Row>
        </Section>

        <Section title="Address">
          <Row label="Street">{address.street}</Row>
          <Row label="City">{address.city}</Row>
          <Row label="Region">{address.region}</Row>
          <Row label="Country">{address.country}</Row>
          <Row label="Postal code">{address.postalCode}</Row>
          <Row label="Coordinates">
            <a
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.google.com/maps?q=${address.coordinates.lat},${address.coordinates.lng}`}
            >
              {address.coordinates.lat}, {address.coordinates.lng}
            </a>
          </Row>
        </Section>

        <Section title="Contact">
          {contact.phones.map((p) => (
            <Row key={p} label="Phone">{p}</Row>
          ))}
          {contact.emails.map((e) => (
            <Row key={e} label="Email">
              <a className={linkClass} href={`mailto:${e}`}>{e}</a>
            </Row>
          ))}
        </Section>

        <Section title="WhatsApp">
          <Row label="Primary">
            <a className={linkClass} target="_blank" rel="noopener noreferrer" href={whatsappLink(whatsapp.primary.number, whatsapp.primary.defaultMessage)}>
              {whatsapp.primary.number}
            </a>
          </Row>
          <Row label="Default message">{whatsapp.primary.defaultMessage}</Row>
          <Row label="Support">
            <a className={linkClass} target="_blank" rel="noopener noreferrer" href={whatsappLink(whatsapp.support.number)}>
              {whatsapp.support.number}
            </a>
          </Row>
        </Section>

        <Section title="Operating hours">
          <Row label="Weekdays">{hours.weekday}</Row>
          <Row label="Saturday">{hours.saturday}</Row>
          <Row label="Sunday">{hours.sunday}</Row>
          <Row label="Holidays">{hours.holidays}</Row>
        </Section>

        <Section title="Social">
          {Object.entries(social).map(([name, url]) => (
            <Row key={name} label={name}>
              <a className={linkClass} target="_blank" rel="noopener noreferrer" href={url}>{url}</a>
            </Row>
          ))}
        </Section>
      </div>
    </div>
  );
}
