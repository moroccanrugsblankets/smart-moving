import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log('Users already exist — skipping seed.');
    return;
  }

  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password) {
    throw new Error('INITIAL_ADMIN_PASSWORD environment variable is required for seeding.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@getmovecost.com',
      name: 'Admin',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  console.log(`✅  Admin user created: ${admin.email}`);

  // Seed default pages so the UI works without manual setup
  const defaultPages = [
    { slug: 'privacy', title: 'Privacy Policy' },
    { slug: 'terms', title: 'Terms of Service' },
    { slug: 'about', title: 'About Us' },
    { slug: 'do-not-sell', title: 'Do Not Sell My Personal Information' },
  ];

  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: { slug: page.slug, title: page.title },
    });
  }

  console.log('✅  Default pages seeded.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
