/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@canteen.com';
  const plainPassword = 'adminpassword123';
  const universityId = 'ADMIN001';

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists!`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email,
      universityId,
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true, // Auto-verify admin
    },
  });

  console.log(`Successfully created manual Admin account!`);
  console.log(`----------------------------------------`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${plainPassword}`);
  console.log(`Role: ${admin.role}`);
  console.log(`----------------------------------------`);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
