import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { usersStore } from '@/lib/fileStore';
import { logActivity } from '@/lib/activityLogger';
import bcrypt from 'bcryptjs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await usersStore.findById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  if (body.role && !['admin', 'manager'].includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const updates: { name?: string; email?: string; role?: 'admin' | 'manager'; passwordHash?: string } = {};
  if (body.name) updates.name = body.name;
  if (body.role) updates.role = body.role;
  if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 10);
  if (body.email && body.email !== existing.email) {
    const conflict = await usersStore.findByEmail(body.email);
    if (conflict) return NextResponse.json({ error: 'Email already in use by another account' }, { status: 409 });
    updates.email = body.email;
  }

  const updated = await usersStore.update(id, updates);
  logActivity(auth.session.user.id, auth.session.user.email, 'UPDATE', 'users', `Updated user: ${updated.email}`);

  const { passwordHash: _, ...safeUser } = updated;
  return NextResponse.json(safeUser);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ['admin']);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  if (id === auth.session.user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  await usersStore.deleteById(id);
  logActivity(auth.session.user.id, auth.session.user.email, 'DELETE', 'users', `Deleted user id: ${id}`);
  return NextResponse.json({ ok: true });
}
