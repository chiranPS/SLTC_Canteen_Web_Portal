import { z } from 'zod';
// We preprocess price and availability since multipart/form-data sends them as strings
export const createMealSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be positive')),
    isAvailable: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(true),
});
export const updateMealSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    price: z.preprocess((val) => val !== undefined ? Number(val) : undefined, z.number().min(0).optional()),
    isAvailable: z.preprocess((val) => {
        if (val === undefined)
            return undefined;
        return val === 'true' || val === true;
    }, z.boolean().optional()),
});
export const queryMealsSchema = z.object({
    categoryId: z.string().optional(),
    search: z.string().optional(),
    isAvailable: z.preprocess((val) => {
        if (val === undefined)
            return undefined;
        return val === 'true' || val === true;
    }, z.boolean().optional()),
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1).optional()),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1).max(100).optional()),
});
export const createCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
    dailyLimit: z.preprocess((val) => val !== undefined && val !== null ? Number(val) : 0, z.number().min(0)).optional().default(0),
    isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(true),
});
export const updateCategorySchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    dailyLimit: z.preprocess((val) => val !== undefined && val !== null ? Number(val) : undefined, z.number().min(0).optional()),
    isActive: z.preprocess((val) => {
        if (val === undefined || val === null)
            return undefined;
        return val === 'true' || val === true;
    }, z.boolean().optional()),
});
