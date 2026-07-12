export class ReportsService {
    reportsRepo;
    constructor(reportsRepo) {
        this.reportsRepo = reportsRepo;
    }
    async getDashboardStats() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const stats = await this.reportsRepo.getTodayStats(startOfDay);
        const popularMeals = await this.reportsRepo.getPopularMeals(5);
        return {
            today: stats,
            popularMeals,
        };
    }
    async getRevenueReport(data) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        // Ensure endDate covers the entire last day
        endDate.setHours(23, 59, 59, 999);
        const orders = await this.reportsRepo.getOrdersInDateRange(startDate, endDate);
        // Group by YYYY-MM-DD
        const groupedData = {};
        for (const order of orders) {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            if (!groupedData[dateKey]) {
                groupedData[dateKey] = { totalOrders: 0, revenue: 0 };
            }
            groupedData[dateKey].totalOrders += 1;
            // Only count revenue if paid
            if (['PAID', 'PREPARING', 'READY', 'COLLECTED'].includes(order.status)) {
                groupedData[dateKey].revenue += Number(order.totalAmount);
            }
        }
        // Convert to array format for frontend charts
        const chartData = Object.keys(groupedData).map(date => ({
            date,
            totalOrders: groupedData[date].totalOrders,
            revenue: groupedData[date].revenue,
        })).sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
        return {
            dateRange: { startDate, endDate },
            chartData,
        };
    }
    async getPeakOrderingPeriods() {
        // Look back last 30 days to establish average peak hours
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();
        const orders = await this.reportsRepo.getOrdersInDateRange(startDate, endDate);
        const hourlyCounts = {};
        for (let i = 0; i < 24; i++) {
            const hourKey = i.toString().padStart(2, '0') + ':00';
            hourlyCounts[hourKey] = 0;
        }
        for (const order of orders) {
            const hour = order.createdAt.getHours();
            const hourKey = hour.toString().padStart(2, '0') + ':00';
            hourlyCounts[hourKey] += 1;
        }
        const chartData = Object.keys(hourlyCounts).map(hour => ({
            hour,
            ordersCount: hourlyCounts[hour],
        })).sort((a, b) => a.hour.localeCompare(b.hour));
        return chartData;
    }
}
