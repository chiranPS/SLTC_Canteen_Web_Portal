import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../cart/context/CartContext';
import { ordersApi } from '../api/orders.api';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { toast } from 'react-toastify';
import { Clock, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const generateTimeSlots = () => {
    if (!cart || cart.items.length === 0) return [];

    let minAllowed = 5; // System opens at 5
    let maxAllowed = 20; // System closes at 20 (8 PM)

    cart.items.forEach(item => {
      const cat = (item.meal.category as any).name?.toLowerCase() || '';
      if (cat.includes('breakfast')) {
        minAllowed = Math.max(minAllowed, 7.5);
        maxAllowed = Math.min(maxAllowed, 11.5);
      } else if (cat.includes('lunch')) {
        minAllowed = Math.max(minAllowed, 11.5);
        maxAllowed = Math.min(maxAllowed, 16);
      } else if (cat.includes('dinner')) {
        minAllowed = Math.max(minAllowed, 16.5);
        maxAllowed = Math.min(maxAllowed, 20);
      }
    });

    const slots = [];
    const now = new Date();
    
    // Earliest possible pickup is either now + 15 mins or the start of the serving window
    const nowHours = now.getHours() + (now.getMinutes() + 15) / 60;
    const startHours = Math.max(nowHours, minAllowed);

    if (startHours >= maxAllowed || minAllowed >= maxAllowed) {
      // Either time has passed or conflicting items in cart
      return [];
    }

    const startTime = new Date(now);
    startTime.setHours(Math.floor(startHours));
    startTime.setMinutes(Math.ceil((startHours % 1) * 60 / 15) * 15);
    startTime.setSeconds(0, 0);

    const maxTime = new Date(now);
    maxTime.setHours(Math.floor(maxAllowed));
    maxTime.setMinutes((maxAllowed % 1) * 60);
    maxTime.setSeconds(0, 0);

    let current = new Date(startTime);
    // Generate up to 12 slots, or until maxTime
    while (current < maxTime && slots.length < 12) {
      const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoString = new Date(current).toISOString();
      slots.push({ label: timeString, value: isoString });
      current.setMinutes(current.getMinutes() + 15);
    }
    return slots;
  };

  const handleCheckout = async () => {
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    
    setIsProcessing(true);
    try {
      // 1. Create Order
      const order = await ordersApi.checkout(pickupTime);
      
      // 2. Process Payment immediately (Simulated flow)
      await ordersApi.processPayment(order.id, 'CARD');
      
      toast.success('Order placed successfully!');
      
      // 3. Clear Cart and Redirect to tracking
      await clearCart();
      navigate('/history');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          You need to add some delicious meals to your cart before proceeding to checkout.
        </p>
        <Button size="lg" onClick={() => navigate('/menu')}>Back to Menu</Button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => acc + (Number(item.meal.price) * item.quantity), 0);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-gray-500 mt-1">Complete your order details below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 rounded-t-2xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="text-primary-600" size={20} /> 
                Select Pickup Time
              </CardTitle>
              <CardDescription>
                Choose when you'd like to collect your meal from the canteen.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {generateTimeSlots().length === 0 ? (
                  <div className="col-span-full text-red-500 font-medium text-sm py-2">
                    No valid pickup times available. This usually happens if you've added items from different meal periods (e.g. Breakfast and Dinner), or if the serving time has passed. Please adjust your cart.
                  </div>
                ) : (
                  generateTimeSlots().map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPickupTime(slot.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                        pickupTime === slot.value 
                          ? "border-primary-600 bg-primary-50 text-primary-900 shadow-sm" 
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      {slot.label}
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 rounded-t-2xl pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="text-primary-600" size={20} /> 
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 border-2 border-primary-600 bg-primary-50/50 rounded-xl flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-8 bg-primary-900 rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider shadow-sm">
                    CARD
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Credit / Debit Card</p>
                    <p className="text-xs text-primary-700 font-medium flex items-center gap-1 mt-0.5">
                      <ShieldCheck size={12} /> Simulated secure checkout
                    </p>
                  </div>
                </div>
                <CheckCircle2 className="text-primary-600 relative z-10" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-gray-200 shadow-xl shadow-gray-200/40">
            <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-5">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {item.quantity}x {item.meal.name}
                      </p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                      Rs. {(Number(item.meal.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>Taxes</span>
                  <span className="font-medium text-gray-900">Included</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary-600">
                    Rs. {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full mt-8 shadow-lg shadow-primary-900/20" 
                size="lg"
                onClick={handleCheckout}
                isLoading={isProcessing}
                disabled={!pickupTime}
              >
                {isProcessing ? 'Processing...' : 'Pay & Place Order'}
              </Button>
              {!pickupTime && (
                <p className="text-xs text-center text-red-500 mt-3 font-medium">
                  Please select a pickup time first
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
