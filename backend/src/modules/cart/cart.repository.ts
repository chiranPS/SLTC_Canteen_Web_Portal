import { PrismaClient, Cart, CartItem } from '@prisma/client';

export class CartRepository {
  constructor(private prisma: PrismaClient) {}

  async findCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            meal: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async createCart(userId: string) {
    return this.prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            meal: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async getCartItem(cartId: string, mealId: string) {
    return this.prisma.cartItem.findFirst({
      where: {
        cartId,
        mealId,
      },
    });
  }

  async createCartItem(cartId: string, mealId: string, quantity: number) {
    return this.prisma.cartItem.create({
      data: {
        cartId,
        mealId,
        quantity,
      },
      include: {
        meal: true,
      },
    });
  }

  async updateCartItemQuantity(id: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        meal: true,
      },
    });
  }

  async removeCartItem(cartId: string, mealId: string) {
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId,
        mealId,
      },
    });
  }

  async clearCart(cartId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
