import nodemailer from 'nodemailer';
import { emailConfigStore, emailTemplatesStore, emailLogsStore, settingsStore } from './fileStore';

export interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  service: string;
  estimate?: string;
  serviceDate: string;
  originZip?: string;
  destZip?: string;
  homeSize?: string;
  companyName?: string;
  requestId?: string;
}

function formatCurrency(value: string | undefined): string {
  if (!value) return 'N/A';
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(numeric)) return value;
  return `$${numeric.toFixed(2)}`;
}

function formatDateUS(value: string | undefined): string {
  if (!value) return 'N/A';
  // Accept YYYY-MM-DD or ISO 8601 strings
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }
  // Already formatted or unknown — return as-is
  return value;
}

function substituteVariables(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
}

function buildVariableMap(lead: LeadEmailData): Record<string, string> {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? '';
  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    estimate: formatCurrency(lead.estimate),
    service_date: formatDateUS(lead.serviceDate),
    origin_zip: lead.originZip ?? 'N/A',
    dest_zip: lead.destZip ?? 'N/A',
    home_size: lead.homeSize ?? 'N/A',
    company_name: lead.companyName ?? 'GetMoveCost.com',
    request_id: lead.requestId ?? 'N/A',
    dashboard_link: `${baseUrl}/backoffice/leads`,
  };
}

async function createTransporter() {
  const config = await emailConfigStore.get();
  if (!config.host || !config.username) return null;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.encryption === 'SSL',
    auth: { user: config.username, pass: config.password },
    from: config.fromEmail || config.username,
  });
}

async function sendTemplateEmail(templateKey: string, to: string, lead: LeadEmailData): Promise<void> {
  const transporter = await createTransporter();
  if (!transporter) return;

  const templates = await emailTemplatesStore.getAll();
  const tpl = templates.find(t => t.key === templateKey);
  if (!tpl) return;

  const vars = buildVariableMap(lead);
  const subject = substituteVariables(tpl.subject, vars);
  const html = substituteVariables(tpl.htmlContent, vars);

  try {
    const config = await emailConfigStore.get();
    await transporter.sendMail({
      from: config.fromEmail || config.username,
      to,
      subject,
      html,
    });
    await emailLogsStore.add({
      id: crypto.randomUUID(),
      to,
      subject,
      sentAt: new Date().toISOString(),
      status: 'sent',
      content: html,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    await emailLogsStore.add({
      id: crypto.randomUUID(),
      to,
      subject,
      sentAt: new Date().toISOString(),
      status: 'failed',
      content: html,
      error,
    });
  }
}

export async function sendLeadEmails(lead: LeadEmailData, adminEmail: string): Promise<void> {
  const settings = await settingsStore.get();
  const fullLead = { ...lead, companyName: lead.companyName ?? settings.companyName };

  await Promise.allSettled([
    sendTemplateEmail('lead_confirmation', lead.email, fullLead),
    sendTemplateEmail('receipt_acknowledgement', lead.email, fullLead),
    sendTemplateEmail('admin_notification', adminEmail || settings.adminEmail, fullLead),
  ]);
}
