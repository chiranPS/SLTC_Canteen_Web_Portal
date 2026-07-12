import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found in the database. Please register a user first.');
    return;
  }
  
  // Make the first registered user an ADMIN
  const firstUser = users[0];
  await prisma.user.update({
    where: { id: firstUser.id },
    data: { role: 'ADMIN' }
  });
  
  console.log(`Successfully elevated ${firstUser.email} to ADMIN role.`);
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
