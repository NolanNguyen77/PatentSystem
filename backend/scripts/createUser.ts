import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create user tan286
  const password1 = '026339229';
  const hashed1 = await bcrypt.hash(password1, 10);

  const user1 = await prisma.user.upsert({
    where: { userId: 'tan286' },
    update: {},
    create: {
      userId: 'tan286',
      name: 'Tan Nguyen',
      password: hashed1,
      email: 'tan286@example.com',
      permission: '管理者',
    },
  });

  console.log('Created user:', user1.userId);
  console.log('Use password:', password1);

  // Create admin user
  const password2 = '123456';
  const hashed2 = await bcrypt.hash(password2, 10);

  const user2 = await prisma.user.upsert({
    where: { userId: 'admin' },
    update: {},
    create: {
      userId: 'admin',
      name: 'Administrator',
      password: hashed2,
      email: 'admin@example.com',
      permission: '管理者',
    },
  });

  console.log('Created user:', user2.userId);
  console.log('Use password:', password2);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
