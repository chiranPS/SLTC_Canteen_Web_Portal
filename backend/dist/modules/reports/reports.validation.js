import { z } from 'zod';
export const dateRangeSchema = z.object({
    startDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), 'Invalid start date'),
    endDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), 'Invalid end date'),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date cannot be before start date",
    path: ["endDate"]
});
