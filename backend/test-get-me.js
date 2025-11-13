require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Test Get Current User...\n');

    // Get user
    const user = await prisma.user.findUnique({
      where: { userId: 'tan286' },
      include: { department: true },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
            no: true,
          },
        },
        permission: true,
        section: true,
        isActive: true,
      },
    });

    console.log('✅ User found:', user);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
