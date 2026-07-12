import { PrismaClient, OrderStatus } from '@prisma/client';

export class ReportsRepository {
  constructor(private prisma: PrismaClient) {}

  async getTodayStats(startOfDay: Date) {
    const todayOrders = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const pendingOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING],
        },
      },
    });

    const completedOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        status: {
          in: [OrderStatus.READY, OrderStatus.COLLECTED],
        },
      },
    });

    // We calculate "Revenue" as only orders that are paid or past the paid state
    const revenueOrders = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
        },
        status: {
          in: [OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COLLECTED],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return {
      totalOrders: todayOrders._count.id,
      totalRevenue: Number(revenueOrders._sum.totalAmount || 0),
      pendingOrders: pendingOrdersCount,
      completedOrders: completedOrdersCount,
    };
  }

  async getPopularMeals(limit: number = 5) {
    const popular = await this.prisma.orderItem.groupBy({
      by: ['mealId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Prisma groupBy doesn't allow including relations directly yet, so we map the names manually
    const mealIds = popular.map(p => p.mealId);
    const meals = await this.prisma.meal.findMany({
      where: { id: { in: mealIds } },
      select: { id: true, name: true, imageUrl: true }
    });

    return popular.map(p => {
      const meal = meals.find(m => m.id === p.mealId);
      return {
        mealId: p.mealId,
        name: meal?.name || 'Unknown Meal',
        imageUrl: meal?.imageUrl || null,
        totalQuantity: p._sum.quantity || 0,
      };
    });
  }

  // To group by date effectively across different databases, it's often better to fetch raw 
  // or pull the data and group in memory if it's not massive, but here we will fetch orders 
  // in the date range and group them in the service layer for simplicity and DB agnostic compatibility.
  async getOrdersInDateRange(startDate: Date, endDate: Date) {
    return this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
  }
}
