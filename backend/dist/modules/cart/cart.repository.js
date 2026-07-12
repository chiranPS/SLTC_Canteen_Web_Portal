export class CartRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findCartByUserId(userId) {
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
    async createCart(userId) {
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
    async getCartItem(cartId, mealId) {
        return this.prisma.cartItem.findFirst({
            where: {
                cartId,
                mealId,
            },
        });
    }
    async createCartItem(cartId, mealId, quantity) {
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
    async updateCartItemQuantity(id, quantity) {
        return this.prisma.cartItem.update({
            where: { id },
            data: { quantity },
            include: {
                meal: true,
            },
        });
    }
    async removeCartItem(cartId, mealId) {
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId,
                mealId,
            },
        });
    }
    async clearCart(cartId) {
        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
}
