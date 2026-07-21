import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ChefHat, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const OrderManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getAllOrders({ limit: 100 }), // Get recent 100 for live board
    refetchInterval: 45000, // Poll every 45s
  });

  const orders = data?.orders || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      toast.success(`Order moved to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const newOrders = orders.filter(o => o.status === 'PAID');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kitchen Operations</h1>
        <p className="text-gray-500 text-lg mt-2">Manage live orders and update fulfillment status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-[calc(100vh-200px)] min-h-[600px]">
        
        {/* NEW ORDERS (PAID) */}
        <div className="flex flex-col bg-slate-50/80 rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500" />
          <div className="p-5 border-b border-gray-100/50 bg-white/60 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <Inbox className="text-primary-600" size={20} /> New Orders
            </h3>
            <span className="bg-primary-900 text-white px-3 py-1 rounded-full text-xs font-black shadow-md shadow-primary-900/20">
              {isLoading ? '...' : newOrders.length}
            </span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {isLoading ? (
              <OrderSkeleton />
            ) : newOrders.length === 0 ? (
              <EmptyState message="No new orders at the moment." />
            ) : (
              newOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  actionLabel="Start Preparing"
                  actionIcon={<ChefHat size={16} className="mr-2" />}
                  onAction={() => handleStatusChange(order.id, 'PREPARING')}
                  isActionLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order.id}
                  variant="primary"
                />
              ))
            )}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex flex-col bg-slate-50/80 rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary-400" />
          <div className="p-5 border-b border-gray-100/50 bg-white/60 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <ChefHat className="text-secondary-500" size={20} /> In Kitchen
            </h3>
            <span className="bg-secondary-400 text-primary-950 px-3 py-1 rounded-full text-xs font-black shadow-md shadow-secondary-400/20">
              {isLoading ? '...' : preparingOrders.length}
            </span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {isLoading ? (
              <OrderSkeleton />
            ) : preparingOrders.length === 0 ? (
              <EmptyState message="No orders currently in preparation." />
            ) : (
              preparingOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  actionLabel="Mark as Ready"
                  actionIcon={<CheckCircle2 size={16} className="mr-2" />}
                  onAction={() => handleStatusChange(order.id, 'READY')}
                  isActionLoading={updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order.id}
                  variant="warning"
                />
              ))
            )}
          </div>
        </div>

        {/* READY FOR PICKUP */}
        <div className="flex flex-col bg-slate-50/80 rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          <div className="p-5 border-b border-gray-100/50 bg-white/60 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={20} /> Ready for Pickup
            </h3>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-md shadow-green-500/20">
              {isLoading ? '...' : readyOrders.length}
            </span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
            {isLoading ? (
              <OrderSkeleton />
            ) : readyOrders.length === 0 ? (
              <EmptyState message="No orders waiting for pickup." />
            ) : (
              readyOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  variant="success"
                  isReady
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Subcomponents for Cleanliness ---

const OrderSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-40 w-full rounded-2xl" />
    <Skeleton className="h-40 w-full rounded-2xl" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
      <Clock size={24} className="text-gray-300" />
    </div>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

const OrderCard = ({ order, actionLabel, actionIcon, onAction, isActionLoading, variant, isReady }: any) => {
  return (
    <Card className={cn(
      "border-0 shadow-sm ring-1 ring-inset hover:shadow-md transition-shadow",
      variant === 'primary' ? 'ring-primary-100 bg-white' : '',
      variant === 'warning' ? 'ring-orange-100 bg-white' : '',
      variant === 'success' ? 'ring-green-200 bg-white shadow-green-900/5' : ''
    )}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
          <div>
            <span className="font-mono font-extrabold text-lg text-gray-900">#{order.orderNumber}</span>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {format(new Date(order.createdAt), 'h:mm a')}
            </p>
          </div>
        </div>
        
        <ul className="text-sm space-y-2 mb-6 text-gray-700 font-medium">
          {order.orderItems.map((item: any) => (
            <li key={item.id} className="flex gap-3">
              <span className="font-bold text-gray-900 bg-gray-100 px-2 rounded-md">{item.quantity}x</span> 
              <span className="line-clamp-2">{item.meal.name}</span>
            </li>
          ))}
        </ul>

        {isReady && (
          <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-2.5 rounded-lg mb-4 font-mono font-semibold text-center uppercase tracking-wider">
            Waiting for QR Scan
          </div>
        )}

        {actionLabel && (
          <Button 
            size="default" 
            className={cn(
              "w-full text-sm font-bold",
              variant === 'primary' ? '' : '',
              variant === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-900/20' : '',
              variant === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20' : ''
            )} 
            onClick={onAction}
            isLoading={isActionLoading}
          >
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
