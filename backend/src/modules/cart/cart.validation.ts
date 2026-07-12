import { z } from 'zod';

export const addItemSchema = z.object({
  mealId: z.string().min(1, 'Meal ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddItemDto = z.infer<typeof addItemSchema>;
export type UpdateQuantityDto = z.infer<typeof updateQuantitySchema>;
