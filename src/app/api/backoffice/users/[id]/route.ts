import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { usersStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const users = usersStore.getAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  if (body.role && !['admin', 'manager'].includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (body.password) {
    users[idx].passwordHash = await bcrypt.hash(body.password, 10);
  }
  if (body.role) users[idx].role = body.role;
  if (body.name) users[idx].name = body.name;
  usersStore.save(users);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'users', `Updated user: ${users[idx].email}`);

  const { passwordHash: _, ...safeUser } = users[idx];
  return NextResponse.json(safeUser);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  if (id === auth.session.user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const users = usersStore.getAll().filter(u => u.id !== id);
  usersStore.save(users);
  logActivity(auth.session.user.id, auth.session.user.email, 'DELETE', 'users', `Deleted user id: ${id}`);
  return NextResponse.json({ ok: true });
}
