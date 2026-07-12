export interface DashboardMetrics {
  totalRevenue: string;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface PopularMeal {
  mealId: string;
  name: string;
  totalQuantity: number;
}
