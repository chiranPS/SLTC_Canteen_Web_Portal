export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  dailyLimit: number;
  currentCount?: number;
}

export interface Meal {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string; // Decimal from Prisma comes as string
  isAvailable: boolean;
  imageUrl: string | null;
  category: Category;
}

export interface PaginatedMeals {
  meals: Meal[];
  total: number;
  pages: number;
  currentPage: number;
}
