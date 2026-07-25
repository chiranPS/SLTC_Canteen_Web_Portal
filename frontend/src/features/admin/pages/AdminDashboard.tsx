import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { TrendingUp, ShoppingBag, Clock, CheckCircle, ScanLine } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getDashboardMetrics,
    refetchInterval: 120000,
  });

  const { data: popularMeals = [], isLoading: isLoadingMeals } = useQuery({
    queryKey: ['admin-popular-meals'],
    queryFn: adminApi.getPopularMeals,
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: () => {
      const end = new Date();
      const start = subDays(end, 6); // Last 7 days including today
      return adminApi.getRevenueReport(start.toISOString(), end.toISOString());
    },
  });

  const { data: peakData = [], isLoading: isLoadingPeak } = useQuery({
    queryKey: ['admin-peak-periods'],
    queryFn: adminApi.getPeakPeriods,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2 text-lg">Real-time overview of canteen performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Revenue */}
        <Card className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white border-0 shadow-[0_15px_40px_rgba(30,58,138,0.3)] transform transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-secondary-400 font-bold text-xs sm:text-sm tracking-wide uppercase">Today's Revenue</p>
                {isLoadingMetrics ? (
                  <Skeleton className="h-8 w-24 sm:w-32 mt-2 bg-primary-700/50" />
                ) : (
                  <h3 className="text-xl sm:text-4xl font-black mt-1 sm:mt-2 tracking-tighter drop-shadow-sm truncate max-w-[120px] sm:max-w-none">
                    Rs. {Number(metrics?.totalRevenue).toFixed(2)}
                  </h3>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-secondary-400 text-primary-950 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan QR Card (Highlighted Special Action Card) */}
        <Card 
          onClick={() => navigate('/admin/scan-qr')}
          className="bg-gradient-to-br from-secondary-500 via-secondary-600 to-amber-600 text-white border-0 shadow-[0_15px_35px_rgba(245,158,11,0.35)] transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(245,158,11,0.5)] cursor-pointer group relative overflow-hidden ring-2 ring-secondary-400/50"
        >
          {/* Subtle glowing background effect */}
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/15 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
          
          <CardContent className="p-4 sm:p-6 relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start gap-1">
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[9px] sm:text-xs tracking-wider uppercase backdrop-blur-sm border border-white/20 mb-1 sm:mb-2">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white"></span>
                  </span>
                  POS Action
                </div>
                <h3 className="text-base sm:text-2xl font-black tracking-tight text-white drop-shadow-sm group-hover:scale-105 transition-transform duration-200 origin-left">
                  Scan QR
                </h3>
                <p className="text-secondary-100 text-[10px] sm:text-xs font-semibold mt-0.5 truncate max-w-[100px] sm:max-w-none">Verify & Collect</p>
              </div>

              <div className="p-2 sm:p-3 bg-white text-secondary-700 rounded-xl sm:rounded-2xl shadow-xl flex-shrink-0 group-hover:rotate-12 transition-transform duration-300 group-hover:bg-amber-100">
                <ScanLine className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
            </div>

            <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-white/20 flex items-center justify-between text-[10px] sm:text-xs font-black tracking-wide text-white/90 group-hover:text-white">
              <span>Launch Camera</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)] bg-white transform transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-bold text-xs sm:text-sm tracking-wide uppercase">Total Orders</p>
                {isLoadingMetrics ? (
                  <Skeleton className="h-8 w-16 sm:w-24 mt-2" />
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black mt-1 sm:mt-2 tracking-tighter text-gray-900">
                    {metrics?.totalOrders}
                  </h3>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-primary-50 rounded-xl sm:rounded-2xl text-primary-600 flex-shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)] bg-white transform transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-bold text-xs sm:text-sm tracking-wide uppercase">Pending Orders</p>
                {isLoadingMetrics ? (
                  <Skeleton className="h-8 w-16 sm:w-24 mt-2" />
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black mt-1 sm:mt-2 tracking-tighter text-gray-900">
                    {metrics?.pendingOrders}
                  </h3>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-secondary-50 rounded-xl sm:rounded-2xl text-secondary-600 flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)] bg-white transform transition-transform hover:-translate-y-1 duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-bold text-xs sm:text-sm tracking-wide uppercase">Completed</p>
                {isLoadingMetrics ? (
                  <Skeleton className="h-8 w-16 sm:w-24 mt-2" />
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black mt-1 sm:mt-2 tracking-tighter text-gray-900">
                    {metrics?.completedOrders}
                  </h3>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-xl sm:rounded-2xl text-green-600 flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Meals */}
        <Card>
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-5 rounded-t-2xl">
            <CardTitle>Popular Meals Today</CardTitle>
            <CardDescription>Top selling items in the canteen</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {isLoadingMeals ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))
              ) : popularMeals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ShoppingBag className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p>No sales data for today yet.</p>
                </div>
              ) : (
                popularMeals.map((meal, index) => (
                  <div key={meal.mealId} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-gray-500 text-sm">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{meal.name}</span>
                    </div>
                    <div className="text-primary-800 font-bold bg-primary-100 px-3 py-1 rounded-full text-sm">
                      {meal.totalQuantity} sold
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-5 rounded-t-2xl">
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
            <CardDescription>Daily revenue performance</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {isLoadingRevenue ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : revenueData?.chartData?.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <TrendingUp className="h-8 w-8 text-gray-300 mb-3" />
                <p>No revenue data in this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData?.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => format(new Date(val), 'MMM dd, yyyy')}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={((value: any) => [`Rs. ${Number(value).toFixed(2)}`, 'Revenue']) as any}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0284c7"
                    strokeWidth={4}
                    dot={{ fill: '#0284c7', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Peak Ordering Periods */}
        <Card>
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-5 rounded-t-2xl">
            <CardTitle>Peak Ordering Hours</CardTitle>
            <CardDescription>Average orders placed per hour (Last 30 Days)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {isLoadingPeak ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : peakData.length === 0 || peakData.every((d: any) => d.ordersCount === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Clock className="h-8 w-8 text-gray-300 mb-3" />
                <p>No order data available yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={((value: any) => [Number(value), 'Orders']) as any}
                  />
                  <Bar dataKey="ordersCount" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Floating Quick-Scan Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <button
          onClick={() => navigate('/admin/scan-qr')}
          className="bg-gradient-to-r from-secondary-500 to-amber-600 hover:from-secondary-600 hover:to-amber-700 text-white p-3.5 sm:p-4 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.5)] border-2 border-white flex items-center gap-2.5 font-extrabold text-sm active:scale-95 transition-all duration-200 group cursor-pointer"
          aria-label="Scan QR Code"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="pr-1 tracking-tight">Scan QR</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      </div>
    </div>
  );
};
