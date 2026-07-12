/// <reference types="node" />
import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Realistic Sri Lankan student/staff names
const firstNames = [
  'Amara', 'Buddhika', 'Chaminda', 'Dinesh', 'Eran', 'Fathima', 'Gayan', 'Harsha',
  'Ishara', 'Janaka', 'Kasun', 'Lahiru', 'Mahela', 'Nimal', 'Oshada', 'Pathum',
  'Ruwan', 'Sajith', 'Thilina', 'Udaya', 'Wasantha', 'Yohan', 'Anura', 'Dilshan',
  'Kanchana', 'Lakmal', 'Manoj', 'Pradeep', 'Roshan', 'Suresh', 'Nipuna', 'Shehan'
];
const lastNames = [
  'Silva', 'Perera', 'Fernando', 'Jayawardena', 'Ranasinghe', 'Gunawardena', 'Herath',
  'Bandara', 'Senanayake', 'Dissanayake', 'Rajapaksha', 'Cooray', 'Mendis', 'Peiris',
  'Samarasinghe', 'Wickramasinghe', 'Karunaratne', 'Alwis', 'Rodrigo', 'Guneratne',
  'Rathnayake', 'Premachandra'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNumber(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  const prefix = 'ORD';
  return `${prefix}-${randomHex}`;
}

async function main() {
  console.log('Starting demo data seeding...');

  // Hash standard password "password123" for all demo users
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Generate 75 random users
  console.log('Generating 75 random users...');
  const users = [];
  for (let i = 0; i < 75; i++) {
    const name = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
    const email = `demo_user_${i + 1}@sltc.lk`;
    const universityId = `ST-2026-${String(i + 1).padStart(4, '0')}`;
    const role: Role = Math.random() < 0.1 ? 'STAFF' : 'STUDENT'; // 10% STAFF, 90% STUDENT
    
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          universityId,
          passwordHash,
          role,
          isEmailVerified: true,
          phoneNumber: `07${getRandomInt(0, 8)}${getRandomInt(1000000, 9999999)}`,
          address: 'SLTC Padukka Campus'
        }
      });
    }
    users.push(user);
  }
  console.log(`Successfully verified/created ${users.length} demo users.`);

  // 2. Fetch all meals
  const meals = await prisma.meal.findMany();
  if (meals.length === 0) {
    console.error('No meals found in database! Please run seed first.');
    return;
  }
  console.log(`Found ${meals.length} meals to use for orders.`);

  // 3. Generate orders for the past week
  console.log('Generating demo orders for the past 7 days...');
  let totalOrdersCreated = 0;
  
  // Date setup
  const now = new Date();

  // Generate orders spread over 7 days (about 20-35 orders per day)
  for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() - dayOffset);

    // Number of orders for this day
    const dayOrdersCount = getRandomInt(20, 35);
    console.log(`Day -${dayOffset} (${currentDate.toDateString()}): Creating ${dayOrdersCount} orders...`);

    for (let o = 0; o < dayOrdersCount; o++) {
      const user = getRandomElement(users);
      const orderNumber = generateOrderNumber();

      // Create a random timestamp for this order on the current date
      const orderDate = new Date(currentDate);
      // Canteen open hours are roughly 7:30 AM to 8:00 PM
      orderDate.setHours(getRandomInt(7, 19), getRandomInt(0, 59), getRandomInt(0, 59));

      // Calculate random pickup time: order time + 15 to 45 minutes
      const pickupTime = new Date(orderDate);
      pickupTime.setMinutes(orderDate.getMinutes() + getRandomInt(15, 45));

      // Select random status
      let status: OrderStatus = 'COLLECTED';
      if (dayOffset === 0) {
        // Today has a mix of active states
        const rand = Math.random();
        if (rand < 0.3) status = 'COLLECTED';
        else if (rand < 0.5) status = 'READY';
        else if (rand < 0.7) status = 'PREPARING';
        else if (rand < 0.85) status = 'PAID';
        else if (rand < 0.93) status = 'PENDING';
        else status = 'CANCELLED';
      } else {
        // Past days are strictly collected or cancelled
        status = Math.random() < 0.95 ? 'COLLECTED' : 'CANCELLED';
      }

      // Generate 1 to 3 order items
      const itemsCount = getRandomInt(1, 3);
      const orderItemsData = [];
      let totalAmount = 0;

      // Keep track of added meals to avoid duplicate meal items in same order
      const addedMealIds = new Set<string>();

      for (let i = 0; i < itemsCount; i++) {
        let meal;
        do {
          meal = getRandomElement(meals);
        } while (addedMealIds.has(meal.id));
        
        addedMealIds.add(meal.id);

        const quantity = getRandomInt(1, 2);
        const price = Number(meal.price);
        totalAmount += price * quantity;

        orderItemsData.push({
          mealId: meal.id,
          quantity,
          unitPrice: price
        });
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          totalAmount,
          status,
          pickupTime,
          createdAt: orderDate,
          updatedAt: orderDate,
        }
      });

      // Create order items
      for (const item of orderItemsData) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            mealId: item.mealId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            createdAt: orderDate,
            updatedAt: orderDate
          }
        });
      }

      // Create payment mapping based on status
      let paymentStatus: PaymentStatus = 'SUCCESS';
      if (status === 'PENDING') {
        paymentStatus = 'PENDING';
      } else if (status === 'CANCELLED') {
        paymentStatus = Math.random() < 0.8 ? 'FAILED' : 'SUCCESS'; // mostly failed or refunded/cancelled
      }

      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          status: paymentStatus,
          transactionId: paymentStatus === 'SUCCESS' ? `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}` : null,
          createdAt: orderDate,
          updatedAt: orderDate
        }
      });

      totalOrdersCreated++;
    }
  }

  console.log(`\nDemo seeding completed! Successfully created ${totalOrdersCreated} orders across 75 users.`);
}

main()
  .catch((e) => {
    console.error('Error during demo seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
