import { successResponse } from '../../shared/responses/apiResponse.js';
export class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboardMetrics = async (req, res) => {
        const stats = await this.reportsService.getDashboardStats();
        res.status(200).json(successResponse('Dashboard metrics fetched', stats.today));
    };
    getPopularMeals = async (req, res) => {
        const stats = await this.reportsService.getDashboardStats();
        res.status(200).json(successResponse('Popular meals fetched', stats.popularMeals));
    };
    getRevenueReport = async (req, res) => {
        // Validated by Zod middleware, injected into req.query
        const report = await this.reportsService.getRevenueReport(req.query);
        res.status(200).json(successResponse('Revenue report fetched', report));
    };
    getPeakOrderingPeriods = async (req, res) => {
        const data = await this.reportsService.getPeakOrderingPeriods();
        res.status(200).json(successResponse('Peak ordering periods fetched', data));
    };
}
