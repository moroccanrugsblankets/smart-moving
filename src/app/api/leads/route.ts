import { NextRequest, NextResponse } from 'next/server';
import { addLead, getLeads } from '@/lib/leadsStore';
import { leadsFileStore, settingsStore } from '@/lib/fileStore';
import { sendLeadEmails } from '@/lib/emailService';
import zipcodes from 'zipcodes';

const ROAD_CORRECTION = 1.15;
const TO_RAD = Math.PI / 180;
const EARTH_RADIUS_MILES = 3958.8;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * TO_RAD;
  const dLon = (lon2 - lon1) * TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * TO_RAD) * Math.cos(lat2 * TO_RAD) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(a));
}

function zipToCity(zip: string | undefined): string | undefined {
  if (!zip) return undefined;
  const info = zipcodes.lookup(zip);
  if (!info) return undefined;
  return `${info.city}, ${info.state}`;
}

function estimateDistance(originZip: string | undefined, destZip: string | undefined): number | undefined {
  if (!originZip || !destZip) return undefined;
  const origin = zipcodes.lookup(originZip);
  const dest   = zipcodes.lookup(destZip);
  if (!origin || !dest) return undefined;
  const straight = haversineDistance(origin.latitude, origin.longitude, dest.latitude, dest.longitude);
  return Math.round(straight * ROAD_CORRECTION);
}

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
    await sendLeadEmails(
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
        requestId: lead.id,
      },
      settings.adminEmail,
    ).catch((err) => console.error('[emailService] Failed to send lead emails:', err));

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const leads = await getLeads();
  const enriched = leads.map(l => ({
    ...l,
    originCity: zipToCity(l.originZip),
    destCity: zipToCity(l.destZip),
    distanceMiles: estimateDistance(l.originZip, l.destZip),
  }));
  return NextResponse.json(enriched);
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
