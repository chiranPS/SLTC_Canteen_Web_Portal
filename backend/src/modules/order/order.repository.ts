import { PrismaClient, Order, OrderStatus, Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  async createOrderFromCart(userId: string, pickupTime: Date, orderNumber: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get Cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { meal: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400, 'EMPTY_CART');
      }

      // 2. Calculate Total & Create Order Items array
      let totalAmount = new Prisma.Decimal(0);
      const orderItemsToCreate = cart.items.map((item) => {
        if (!item.meal.isAvailable) {
          throw new AppError(`Meal ${item.meal.name} is currently out of stock.`, 400, 'OUT_OF_STOCK');
        }

        const unitPrice = item.meal.price;
        const lineTotal = Number(unitPrice) * item.quantity;
        totalAmount = totalAmount.add(lineTotal);

        return {
          mealId: item.mealId,
          quantity: item.quantity,
          unitPrice: unitPrice,
        };
      });

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          totalAmount,
          pickupTime,
          status: 'PENDING',
          orderItems: {
            create: orderItemsToCreate,
          },
        },
        include: {
          orderItems: {
            include: { meal: true },
          },
        },
      });

      // 4. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { meal: true },
        },
        user: {
          select: { name: true, email: true, universityId: true },
        },
      },
    });
  }

  async findOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { meal: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrders(filters: { status?: OrderStatus, page?: number, limit?: number, categoryId?: string, search?: string }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.orderNumber = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.categoryId) {
      where.orderItems = {
        some: {
          meal: {
            categoryId: filters.categoryId
          }
        }
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true, universityId: true },
          },
          orderItems: {
            include: { meal: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true, universityId: true },
        },
      },
    });
  }
}
