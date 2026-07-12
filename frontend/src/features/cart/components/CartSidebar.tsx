import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { getImageUrl } from '../../../utils/image';

export const CartSidebar: React.FC = () => {
  const { cart, isSidebarOpen, toggleSidebar, updateItem, removeItem, totalItems } = useCart();
  const navigate = useNavigate();

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  if (!isSidebarOpen) return null;

  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.meal.price) * item.quantity), 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300" 
        onClick={toggleSidebar}
      />
      
      {/* Sidebar Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-primary-50 p-2 rounded-xl">
              <ShoppingBag size={22} className="text-primary-600" />
            </div>
            Your Order
            {totalItems > 0 && (
              <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-2 py-0.5 rounded-full">
                {totalItems} items
              </span>
            )}
          </h2>
          <button 
            onClick={toggleSidebar} 
            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
 
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-gray-50/50">
          {(!cart || cart.items.length === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 max-w-[250px]">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button variant="primary" className="mt-8 px-8" onClick={toggleSidebar}>
                Browse Menu
              </Button>
            </div>
          ) : (
            cart.items.map((item, i) => (
              <div 
                key={item.id} 
                className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-in slide-in-from-right-4 fade-in"
                style={{ animationFillMode: 'both', animationDelay: `${i * 50}ms` }}
              >
                {/* Item Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  {item.meal.imageUrl ? (
                    <img src={getImageUrl(item.meal.imageUrl)} alt={item.meal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">{item.meal.name}</h4>
                    <button 
                      onClick={() => removeItem(item.mealId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors -mt-1 -mr-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-3">
                    <p className="font-extrabold text-primary-600">
                      Rs. {Number(item.meal.price).toFixed(2)}
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                      <button 
                        onClick={() => updateItem(item.mealId, item.quantity - 1)}
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-md transition-all",
                          item.quantity <= 1 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-gray-600 hover:bg-white hover:shadow-sm hover:text-primary-600"
                        )}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-gray-900">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateItem(item.mealId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm hover:text-primary-600 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Sticky Checkout Summary) */}
        {cart && cart.items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white z-10 shadow-[0_-10px_30px_rgb(0,0,0,0.03)]">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Taxes & Fees</span>
                <span className="font-medium text-gray-900">Calculated at checkout</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-black text-primary-600 text-2xl">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>
            </div>
            
            <Button 
              className="w-full text-base font-bold shadow-primary-900/20" 
              size="lg"
              onClick={() => {
                toggleSidebar();
                navigate('/checkout');
              }}
            >
              Checkout Now
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
