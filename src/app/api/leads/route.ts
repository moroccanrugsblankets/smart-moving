import { NextRequest, NextResponse } from 'next/server';
import { addLead, getLeads } from '@/lib/leadsStore';
import { leadsFileStore, settingsStore } from '@/lib/fileStore';
import { sendLeadEmails } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body._honeypot) {
      return NextResponse.json({ success: true });
    }

    const {
      firstName, lastName, email, phone, serviceDate, serviceType,
      originZip, destZip, homeSize, estimate,
    } = body;

    if (!firstName || !lastName || !email || !phone || !serviceDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const lead = await addLead({
      firstName, lastName, email, phone, serviceDate,
      serviceType, originZip, destZip, homeSize, estimate,
    });

    const settings = await settingsStore.get();
    sendLeadEmails(
      {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        service: serviceType ?? '',
        estimate,
        serviceDate,
        originZip,
        destZip,
        homeSize,
      },
      settings.adminEmail,
    ).catch((err) => console.error('[emailService] Failed to send lead emails:', err));

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(await getLeads());
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await leadsFileStore.deleteById(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
