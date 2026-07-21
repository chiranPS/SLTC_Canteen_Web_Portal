process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from the root folder
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Starting DB connection test...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function test() {
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Connection successful!');
    console.log('📊 Total user records found:', userCount);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
