import { Request, Response } from 'express';
import { ReportsService } from './reports.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  getDashboardMetrics = async (req: Request, res: Response) => {
    const stats = await this.reportsService.getDashboardStats();
    res.status(200).json(successResponse('Dashboard metrics fetched', stats.today));
  };

  getPopularMeals = async (req: Request, res: Response) => {
    const stats = await this.reportsService.getDashboardStats();
    res.status(200).json(successResponse('Popular meals fetched', stats.popularMeals));
  };

  getRevenueReport = async (req: Request, res: Response) => {
    // Validated by Zod middleware, injected into req.query
    const report = await this.reportsService.getRevenueReport(req.query as any);
    res.status(200).json(successResponse('Revenue report fetched', report));
  };

  getPeakOrderingPeriods = async (req: Request, res: Response) => {
    const data = await this.reportsService.getPeakOrderingPeriods();
    res.status(200).json(successResponse('Peak ordering periods fetched', data));
  };
}
