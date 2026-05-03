import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { usersStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const users = (await usersStore.getAll()).map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { name, email, password, role } = body;
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (!['admin', 'manager'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const existing = await usersStore.findByEmail(email);
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await usersStore.create({
    id: crypto.randomUUID(),
    email,
    name,
    role: role as 'admin' | 'manager',
    passwordHash,
  });
  logActivity(auth.session.user.id, auth.session.user.email, 'CREATE', 'users', `Created user: ${email}`);

  const { passwordHash: _, ...safeUser } = newUser;
  return NextResponse.json(safeUser, { status: 201 });
}
