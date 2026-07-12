import React from 'react';
import type { Meal } from '../types/menu.types';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';
import { useCart } from '../../cart/context/CartContext';
import { Badge } from '../../../components/ui/Badge';
import { getImageUrl } from '../../../utils/image';

export interface MealCardProps {
  meal: Meal;
  isOrderingEnabled?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, isOrderingEnabled = true }) => {
  const { addItem } = useCart();
  
  // Use dailyLimit to check if sold out
  const category = meal.category as any; // Cast for now
  const isSoldOut = category?.dailyLimit > 0 && category?.currentCount >= category?.dailyLimit;
  
  const canOrder = meal.isAvailable && !isSoldOut && isOrderingEnabled;

  return (
    <Card className="overflow-hidden flex flex-col group hover:shadow-[0_20px_50px_rgba(30,58,138,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 bg-white border border-gray-100 rounded-3xl cursor-pointer">
      <div className="relative h-40 sm:h-56 bg-gray-100 overflow-hidden">
        {meal.imageUrl ? (
          <img 
            src={getImageUrl(meal.imageUrl)} 
            alt={meal.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            No Image Available
          </div>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-10">
          <Badge variant="default" className="bg-white/90 backdrop-blur-md text-primary-900 border-none shadow-[0_4px_12px_rgba(0,0,0,0.05)] font-bold px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs">
            {meal.category.name}
          </Badge>
          {!meal.isAvailable ? (
            <Badge variant="danger" className="shadow-sm">
              Out of Stock
            </Badge>
          ) : isSoldOut ? (
            <Badge variant="danger" className="shadow-sm bg-red-100 text-red-800 border-red-200">
              Sold Out
            </Badge>
          ) : null}
        </div>
      </div>
      
      <CardContent className="flex-1 p-3 pt-3 sm:p-5 sm:pt-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2 sm:gap-3">
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-lg leading-tight line-clamp-2">
              {meal.name}
            </h3>
            <span className="font-black text-gray-900 whitespace-nowrap bg-secondary-400 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-sm shadow-secondary-400/20 text-xs sm:text-sm self-start sm:self-auto">
              Rs. {Number(meal.price).toFixed(2)}
            </span>
          </div>
          {meal.description && (
            <p className="text-[11px] sm:text-sm text-gray-500 line-clamp-2 mt-1 sm:mt-2 leading-relaxed">
              {meal.description}
            </p>
          )}
        </div>
        
        <Button 
          onClick={() => addItem(meal.id, 1)} 
          disabled={!canOrder}
          className="w-full mt-4 sm:mt-6 h-10 sm:h-12 text-xs sm:text-sm font-bold shadow-md shadow-primary-900/10 group-hover:bg-primary-800 transition-colors duration-300"
          variant={canOrder ? 'primary' : 'secondary'}
        >
          {canOrder ? (
            <>
              <Plus size={18} className="mr-2" />
              Add to Cart
            </>
          ) : !meal.isAvailable ? (
            'Unavailable'
          ) : isSoldOut ? (
            'Sold Out for Today'
          ) : (
            'Ordering Closed'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
