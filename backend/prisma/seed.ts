import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to prevent foreign key errors
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.category.deleteMany();

  const categoriesData = [
    {
      name: 'Breakfast',
      description: 'Open from 7.30 am to 11.30 am',
      dailyLimit: 150,
      meals: [
        { name: 'Rice and Curry', price: 180.00 },
        { name: 'Thosai (Dosa)', price: 100.00 },
        { name: 'String Hoppers', price: 150.00 },
        { name: 'Noodles', price: 180.00 },
        { name: 'Parata', price: 80.00 },
        { name: 'Egg Roti', price: 140.00 },
        { name: 'Bread', price: 200.00 },
        { name: 'Milk Rice', price: 80.00 },
      ]
    },
    {
      name: 'Lunch',
      description: 'Open from 11.30 am to 4.00 pm',
      dailyLimit: 300,
      meals: [
        { name: 'Rice and Curry (Chicken)', price: 290.00 },
        { name: 'Rice and Curry (Egg)', price: 280.00 },
        { name: 'Rice and Curry (Fish)', price: 280.00 },
        { name: 'Rice and Curry (Veg)', price: 230.00 },
        { name: 'Fried Rice (Chicken Mix)', price: 350.00 },
        { name: 'Fried Rice (Chicken Leg)', price: 450.00 },
        { name: 'Biriyani', price: 700.00 },
      ]
    },
    {
      name: 'Dinner',
      description: 'Open from 4.30 pm to 8.00 pm',
      dailyLimit: 50,
      meals: [
        { name: 'Rice and Curry (Chicken)', price: 290.00 },
        { name: 'Rice and Curry (Egg)', price: 280.00 },
        { name: 'Rice and Curry (Fish)', price: 280.00 },
        { name: 'Rice and Curry (Veg)', price: 230.00 },
        { name: 'Fried Rice (Chicken Mix)', price: 350.00 },
        { name: 'Fried Rice (Chicken Leg)', price: 450.00 },
        { name: 'Sausage Fried Rice', price: 300.00 },
        { name: 'Koththu', price: 450.00 },
        { name: 'String Hopper Koththu', price: 450.00 },
        { name: 'Pasta', price: 280.00 },
        { name: 'Noodles', price: 280.00 },
      ]
    },
    {
      name: 'Tea / Beverages',
      description: 'Available throughout the day',
      dailyLimit: 0,
      meals: [
        { name: 'Nescafe', price: 120.00 },
        { name: 'Tea', price: 120.00 },
        { name: 'Plain Tea', price: 40.00 },
        { name: 'Coffee', price: 70.00 },
      ]
    }
  ];

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
        dailyLimit: cat.dailyLimit,
      },
    });

    for (const meal of cat.meals) {
      await prisma.meal.create({
        data: {
          categoryId: createdCat.id,
          name: meal.name,
          price: meal.price,
          description: `Delicious ${meal.name}`,
          isAvailable: true,
        },
      });
    }
  }

  // Create default system settings
  await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      isOrderingPaused: false,
    }
  });

  console.log('Real Canteen menu seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
