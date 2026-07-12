import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function revertAdmin() {
  await prisma.user.updateMany({
    where: { 
      email: { not: 'admin@canteen.com' }
    },
    data: { role: 'STUDENT' }
  });

  console.log(`Successfully reverted all standard users to STUDENT role.`);
}

revertAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
