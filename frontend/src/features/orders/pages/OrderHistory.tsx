import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { Card, CardContent } from '../../../components/ui/Card';
import { Package, MapPin, Clock, LayoutGrid, List, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = React.useState<'card' | 'table'>('card');
  const [enlargedQr, setEnlargedQr] = React.useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders-history'],
    queryFn: ordersApi.getHistory,
    refetchInterval: 10000, // Auto-refresh order statuses every 10s
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="animate-pulse">Pending</Badge>;
      case 'PAID':
        return <Badge variant="default">Paid - Waiting</Badge>;
      case 'PREPARING':
        return <Badge variant="secondary">Preparing</Badge>;
      case 'READY':
        return <Badge variant="success" className="animate-pulse shadow-sm shadow-green-900/20">Ready for Pickup</Badge>;
      case 'COLLECTED':
        return <Badge variant="outline">Collected</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">Order History</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Track your active orders and view past purchases.</p>
        </div>
        
        {orders.length > 0 && (
          <div className="flex bg-primary-950/50 p-1.5 rounded-2xl backdrop-blur-md relative z-10 border border-white/10 shadow-inner">
            <button
              onClick={() => setViewType('card')}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${viewType === 'card' ? 'bg-secondary-400 shadow-md text-primary-950 font-bold transform scale-105' : 'text-primary-200 hover:text-white hover:bg-white/10'}`}
              title="Card View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${viewType === 'table' ? 'bg-secondary-400 shadow-md text-primary-950 font-bold transform scale-105' : 'text-primary-200 hover:text-white hover:bg-white/10'}`}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed text-center px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Package size={48} className="text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 max-w-md mb-8">
            You haven't placed any orders yet. Head over to the menu to order your first meal!
          </p>
          <Button size="lg" onClick={() => navigate('/menu')}>
            Browse Menu
          </Button>
        </div>
      ) : viewType === 'card' ? (
        <div className="space-y-6">
          {orders.map((order, i) => (
            <Card 
              key={order.id} 
              className={`overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in hover:shadow-[0_15px_40px_rgba(30,58,138,0.08)] transform hover:-translate-y-1 rounded-3xl border-gray-100 cursor-pointer ${
                order.status === 'READY' ? 'border-2 border-green-400 shadow-[0_10px_30px_rgba(34,197,94,0.15)]' : ''
              }`}
              style={{ animationFillMode: 'both', animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                      <span className="font-mono font-extrabold text-lg text-primary-900">
                        #{order.orderNumber}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <Clock size={16} className="text-primary-600" />
                    Pickup: {format(new Date(order.pickupTime), 'h:mm a, MMM do')}
                  </div>
                </div>

                {/* QR Code Section for Active Orders */}
                {['PAID', 'PREPARING', 'READY'].includes(order.status) && order.qrString && (
                  <div className="bg-primary-50/30 border-b border-primary-100 px-6 py-4 flex items-start gap-5">
                    <div 
                      className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 shrink-0 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setEnlargedQr(order.qrString!)}
                      title="Click to enlarge"
                    >
                      <img src={order.qrString} alt="Order QR Code" className="w-24 h-24" />
                    </div>
                    <div className="pt-2">
                      <h4 className="font-bold text-primary-900 text-lg">Active Order Pass</h4>
                      <p className="text-gray-600 text-sm font-medium mt-1">
                        Please present this unique QR code at the counter to collect your order. 
                        It will automatically expire once scanned by the staff.
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="bg-gray-100 text-gray-700 font-bold px-2 py-1 rounded-md text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-gray-900">{item.meal.name}</span>
                        </div>
                        <span className="font-semibold text-gray-600">
                          Rs. {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div className="text-sm text-gray-500 flex flex-col">
                      <span>Placed on {format(new Date(order.createdAt), 'MMM do, yyyy')}</span>
                      <span className="flex items-center gap-1 mt-1 text-primary-600 font-medium">
                        <MapPin size={14} /> SLTC Main Canteen
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Total</p>
                      <p className="text-2xl font-black text-primary-600">
                        Rs. {Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Pickup Time</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(order.createdAt), 'MMM do, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {format(new Date(order.pickupTime), 'h:mm a')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]" title={order.orderItems.map(i => `${i.quantity}x ${i.meal.name}`).join(', ')}>
                      {order.orderItems.map(i => `${i.quantity}x ${i.meal.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      Rs. {Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Enlarged QR Modal */}
      {enlargedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEnlargedQr(null)}>
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center gap-6 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setEnlargedQr(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mt-2">
              <h3 className="text-xl font-bold text-gray-900">Your Order Pass</h3>
              <p className="text-sm text-gray-500 mt-1">Scan at the counter to collect</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <img src={enlargedQr} alt="Enlarged QR" className="w-64 h-64" />
            </div>

            <a 
              href={enlargedQr} 
              download="sltc-order-pass.png"
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-primary-900/20"
            >
              <Download size={20} />
              Save to Device
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
