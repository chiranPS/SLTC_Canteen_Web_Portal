import { Router } from 'express';
import { validateRequest } from '../../shared/middlewares/validate.middleware.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';
import { dateRangeSchema } from './reports.validation.js';
export const createReportsRouter = (reportsController) => {
    const router = Router();
    // All reporting routes strictly require STAFF or ADMIN roles
    router.use(authenticate, requireRole(['ADMIN', 'STAFF']));
    router.get('/dashboard', reportsController.getDashboardMetrics);
    router.get('/popular', reportsController.getPopularMeals);
    router.get('/revenue', validateRequest(dateRangeSchema), reportsController.getRevenueReport);
    router.get('/peak-periods', reportsController.getPeakOrderingPeriods);
    return router;
};
