import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { menuApi } from '../../menu/api/menu.api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Select } from '../../../components/ui/Select';
import { Search, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '../../orders/types/orders.types';

export const AllOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Fetch Categories for Filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  });

  // Fetch Paginated Orders
  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-orders', page, limit, search, categoryId, status],
    queryFn: () => adminApi.getAllOrders({
      page,
      limit,
      search: search || undefined,
      categoryId: categoryId !== 'all' ? categoryId : undefined,
      status: status !== 'all' ? status : undefined
    }),
    placeholderData: (prev) => prev,
  });

  const orders: Order[] = data?.orders || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'PAID': return <Badge variant="default">Paid</Badge>;
      case 'PREPARING': return <Badge variant="secondary">Preparing</Badge>;
      case 'READY': return <Badge variant="success">Ready</Badge>;
      case 'COLLECTED': return <Badge variant="outline">Collected</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">All Orders</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Historical order data and advanced filtering.</p>
        </div>
      </div>

      {/* Filters & Table */}
      <Card className="overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)] bg-white">
        
        {/* Filters Row */}
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col lg:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-80">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input 
                type="text"
                placeholder="Search Order #..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 lg:ml-auto">
            <Select
              className="w-full sm:w-48"
              value={categoryId}
              onChange={(val) => { setCategoryId(val); setPage(1); }}
              options={[
                { label: 'All Categories', value: 'all' },
                ...categories.map((c: any) => ({ label: c.name, value: c.id }))
              ]}
            />
            
            <Select
              className="w-full sm:w-48"
              value={status}
              onChange={(val) => { setStatus(val); setPage(1); }}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Paid', value: 'PAID' },
                { label: 'Preparing', value: 'PREPARING' },
                { label: 'Ready', value: 'READY' },
                { label: 'Collected', value: 'COLLECTED' },
                { label: 'Cancelled', value: 'CANCELLED' }
              ]}
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Items</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Total</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-full" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No orders found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                      <span className="font-mono font-bold text-primary-900 bg-primary-50 px-2 py-1 rounded-md">
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock size={16} className="text-gray-400" />
                        {format(new Date(order.createdAt), 'MMM dd, h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">{order.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 font-mono">{order.user?.universityId}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems.map((item: any) => (
                          <span key={item.id} className="bg-white border border-gray-200 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                            {item.quantity}x {item.meal.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-medium text-gray-500 text-center sm:text-left">
            Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, meta.total)}</span> of <span className="font-bold text-gray-900">{meta.total}</span> entries
          </p>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="rounded-lg border-gray-200 px-3"
            >
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1 px-2 font-medium text-sm text-gray-600">
              Page {page} of {meta.totalPages || 1}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages || isLoading}
              className="rounded-lg border-gray-200 px-3"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
