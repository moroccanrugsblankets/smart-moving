import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { emailLogsStore, emailConfigStore } from '@/lib/fileStore';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const log = await emailLogsStore.findById(id);
  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const config = await emailConfigStore.get();
  if (!config.host || !config.username) {
    return NextResponse.json({ error: 'SMTP not configured' }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'SSL',
      auth: { user: config.username, pass: config.password },
    });

    await transporter.sendMail({
      from: config.fromEmail || config.username,
      to: log.to,
      subject: log.subject,
      html: log.content,
    });

    await emailLogsStore.add({
      id: crypto.randomUUID(),
      to: log.to,
      subject: `[Resent] ${log.subject}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
      content: log.content,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error }, { status: 500 });
  }
}
