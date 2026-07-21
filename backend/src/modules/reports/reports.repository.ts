import { PrismaClient, OrderStatus } from '@prisma/client';

// ---------------------------------------------------------------------------
// Simple in-memory TTL cache — no extra dependencies needed.
// Prevents hammering the DB with the same expensive queries on every poll.
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}

// Shared cache instance for all report queries
const reportCache = new SimpleCache();

// Cache TTLs
const TTL = {
  TODAY_STATS: 30_000,        // 30 seconds  — refreshes often but not per-request
  POPULAR_MEALS: 60_000,      // 60 seconds  — doesn't need real-time accuracy
  REVENUE_CHART: 5 * 60_000,  // 5 minutes   — historical data, barely changes
  PEAK_PERIODS: 5 * 60_000,   // 5 minutes   — 30-day aggregate, very stable
};

export class ReportsRepository {
  constructor(private prisma: PrismaClient) {}

  async getTodayStats(startOfDay: Date) {
    const cacheKey = `today-stats:${startOfDay.toISOString().slice(0, 10)}`;
    const cached = reportCache.get<Awaited<ReturnType<typeof this._fetchTodayStats>>>(cacheKey);
    if (cached) return cached;

    const result = await this._fetchTodayStats(startOfDay);
    reportCache.set(cacheKey, result, TTL.TODAY_STATS);
    return result;
  }

  private async _fetchTodayStats(startOfDay: Date) {
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
    const cacheKey = `popular-meals:${limit}`;
    const cached = reportCache.get<Awaited<ReturnType<typeof this._fetchPopularMeals>>>(cacheKey);
    if (cached) return cached;

    const result = await this._fetchPopularMeals(limit);
    reportCache.set(cacheKey, result, TTL.POPULAR_MEALS);
    return result;
  }

  private async _fetchPopularMeals(limit: number) {
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
    const cacheKey = `revenue:${startDate.toISOString().slice(0, 10)}:${endDate.toISOString().slice(0, 10)}`;
    const cached = reportCache.get<Awaited<ReturnType<typeof this._fetchOrdersInDateRange>>>(cacheKey);
    if (cached) return cached;

    const result = await this._fetchOrdersInDateRange(startDate, endDate);
    reportCache.set(cacheKey, result, TTL.REVENUE_CHART);
    return result;
  }

  private async _fetchOrdersInDateRange(startDate: Date, endDate: Date) {
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

  /**
   * Invalidate today's stats cache — call this after an order status change
   * so the next admin dashboard refresh gets fresh data.
   */
  invalidateTodayStats(date: Date): void {
    reportCache.invalidate(`today-stats:${date.toISOString().slice(0, 10)}`);
  }
}
