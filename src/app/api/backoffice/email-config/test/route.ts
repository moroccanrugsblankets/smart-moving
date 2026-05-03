import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailConfigStore, emailLogsStore } from '@/lib/fileStore';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: 'Recipient email required' }, { status: 400 });

  const config = emailConfigStore.get();
  if (!config.host || !config.username) {
    return NextResponse.json({ error: 'SMTP not configured' }, { status: 400 });
  }

  const subject = 'Test Email from SmartMoving Admin';
  const content = `<p>This is a test email sent from the SmartMoving.com admin panel.</p><p>If you received this, SMTP is configured correctly.</p>`;

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'SSL',
      auth: { user: config.username, pass: config.password },
    });

    await transporter.sendMail({
      from: config.fromEmail || config.username,
      to,
      subject,
      html: content,
    });

    emailLogsStore.add({
      id: crypto.randomUUID(),
      to,
      subject,
      sentAt: new Date().toISOString(),
      status: 'sent',
      content,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    emailLogsStore.add({
      id: crypto.randomUUID(),
      to,
      subject,
      sentAt: new Date().toISOString(),
      status: 'failed',
      content,
      error,
    });
    return NextResponse.json({ error }, { status: 500 });
  }
}
