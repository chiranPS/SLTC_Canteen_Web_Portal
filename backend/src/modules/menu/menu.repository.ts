import { PrismaClient, Category, Meal, Prisma } from '@prisma/client';

export class MenuRepository {
  constructor(private prisma: PrismaClient) {}

  async findCategories(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const today5AM = new Date(now);
    today5AM.setHours(5, 0, 0, 0);
    if (now < today5AM) {
      today5AM.setDate(today5AM.getDate() - 1);
    }

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const agg = await this.prisma.orderItem.aggregate({
          _sum: { quantity: true },
          where: {
            meal: { categoryId: cat.id },
            order: {
              createdAt: { gte: today5AM },
              status: { in: ['PAID', 'PREPARING', 'READY', 'COLLECTED'] }
            }
          }
        });
        return {
          ...cat,
          currentCount: agg._sum.quantity || 0
        };
      })
    );

    return categoriesWithCount;
  }

  async findCategoryById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async findCategoryByName(name: string) {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  async countMealsByCategoryId(categoryId: string) {
    return this.prisma.meal.count({
      where: { categoryId },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async findMeals(filters: { categoryId?: string; search?: string; isAvailable?: boolean; skip?: number; take?: number }): Promise<{ meals: Meal[], total: number }> {
    const whereClause: Prisma.MealWhereInput = {};

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.isAvailable !== undefined) {
      whereClause.isAvailable = filters.isAvailable;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const skip = filters.skip || 0;
    const take = filters.take || 100;

    const [meals, total] = await this.prisma.$transaction([
      this.prisma.meal.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.meal.count({ where: whereClause })
    ]);

    return { meals, total };
  }

  async findMealById(id: string): Promise<Meal | null> {
    return this.prisma.meal.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async createMeal(data: Prisma.MealUncheckedCreateInput): Promise<Meal> {
    return this.prisma.meal.create({
      data,
      include: { category: true },
    });
  }

  async updateMeal(id: string, data: Prisma.MealUncheckedUpdateInput): Promise<Meal> {
    return this.prisma.meal.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteMeal(id: string): Promise<void> {
    await this.prisma.meal.delete({
      where: { id },
    });
  }
}
