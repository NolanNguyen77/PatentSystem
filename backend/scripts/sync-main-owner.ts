import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncMainOwner() {
  console.log('🔄 Syncing main_owner_id from title_users...');

  try {
    // Get all titles
    const titles = await prisma.title.findMany({
      include: {
        titleUsers: {
          where: {
            isMainResponsible: true
          }
        }
      }
    });

    let updated = 0;
    let skipped = 0;

    for (const title of titles) {
      const mainUser = title.titleUsers[0]; // Get first main responsible user

      if (mainUser) {
        // Update title with main owner
        await prisma.title.update({
          where: { id: title.id },
          data: { mainOwnerId: mainUser.userId }
        });
        console.log(`✅ Updated title ${title.titleNo}: main_owner_id = ${mainUser.userId}`);
        updated++;
      } else {
        console.log(`⚠️  Skipped title ${title.titleNo}: no main responsible user found`);
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Updated: ${updated} titles`);
    console.log(`   Skipped: ${skipped} titles`);
    console.log('✅ Sync completed!');

  } catch (error) {
    console.error('❌ Error syncing main owner:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

syncMainOwner();
