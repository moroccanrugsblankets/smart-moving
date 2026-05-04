import { NextRequest, NextResponse } from 'next/server';
import zipcodes from 'zipcodes';

const ROAD_CORRECTION = 1.15;
const TO_RAD = Math.PI / 180;
const EARTH_RADIUS_MILES = 3958.8;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = (lat2 - lat1) * TO_RAD;
  const dLon = (lon2 - lon1) * TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * TO_RAD) * Math.cos(lat2 * TO_RAD) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MILES * 2 * Math.asin(Math.sqrt(a));
}

export async function POST(req: NextRequest) {
  try {
    const { originZip, destZip } = await req.json();

    if (
      typeof originZip !== 'string' ||
      typeof destZip !== 'string' ||
      !/^\d{5}$/.test(originZip) ||
      !/^\d{5}$/.test(destZip)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid ZIP codes' },
        { status: 400 },
      );
    }

    const origin = zipcodes.lookup(originZip);
    const dest   = zipcodes.lookup(destZip);

    if (!origin) {
      return NextResponse.json(
        { success: false, notFound: 'origin' },
        { status: 404 },
      );
    }
    if (!dest) {
      return NextResponse.json(
        { success: false, notFound: 'destination' },
        { status: 404 },
      );
    }

    const straight = haversineDistance(
      origin.latitude,
      origin.longitude,
      dest.latitude,
      dest.longitude,
    );
    const distance = Math.round(straight * ROAD_CORRECTION);

    return NextResponse.json({ success: true, distance });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
