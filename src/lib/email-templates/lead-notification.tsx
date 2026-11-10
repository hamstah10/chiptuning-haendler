import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  form?: string
  name?: string
  company?: string
  email?: string
  phone?: string
  details?: Array<{ key: string; value: string }>
}

const LeadNotification = ({ form = 'Formular', name = '–', company, email, phone, details = [] }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>{`Neue Anfrage (${form}) von ${name}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>TUNINGFILES-DOWNLOAD.COM</Text>
        <Heading style={h1}>Neue Anfrage: {form}</Heading>
        <Section style={box}>
          <Text style={row}><b>Name:</b> {name}</Text>
          {company ? <Text style={row}><b>Firma:</b> {company}</Text> : null}
          {email ? <Text style={row}><b>E-Mail:</b> {email}</Text> : null}
          {phone ? <Text style={row}><b>Telefon:</b> {phone}</Text> : null}
        </Section>
        {details.length ? (
          <Section style={box}>
            {details.map((d) => <Text key={d.key} style={row}><b>{d.key}:</b> {d.value}</Text>)}
          </Section>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: LeadNotification,
  subject: (d: Record<string, any>) => `Neue Anfrage (${d['form'] ?? 'Formular'}) – ${d['name'] ?? ''}`,
  displayName: 'Lead-Benachrichtigung (Inhaber)',
  to: 'hamstahstudio@gmail.com',
  previewData: { form: 'Partner-Wizard', name: 'Max Muster', company: 'Muster Tuning', email: 'max@example.com', phone: '+49 170 000000', details: [{ key: 'goal', value: 'start' }] },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const brand = { color: '#bd1e23', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', margin: '0 0 8px' }
const h1 = { color: '#161616', fontSize: '22px', margin: '0 0 16px' }
const box = { border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' }
const row = { color: '#161616', fontSize: '14px', margin: '4px 0' }
