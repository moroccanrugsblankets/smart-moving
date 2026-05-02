import { NextRequest, NextResponse } from 'next/server';
import { addLead, getLeads } from '@/lib/leadsStore';

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

    const lead = addLead({
      firstName, lastName, email, phone, serviceDate,
      serviceType, originZip, destZip, homeSize, estimate,
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ leads: getLeads() });
}
