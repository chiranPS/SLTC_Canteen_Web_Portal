import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../api/menu.api';
import { getSystemSettings } from '../../../shared/api/settings.api';
import { MealCard } from '../components/MealCard';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Search, ChefHat, AlertCircle } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { cn } from '../../../utils/cn';

export const MenuBrowser: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [hasShownPausePopup, setHasShownPausePopup] = useState(false);

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  });

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: getSystemSettings,
    refetchInterval: 30000,
  });

  React.useEffect(() => {
    if (settings?.isOrderingPaused) {
      if (!hasShownPausePopup) {
        setIsAlertModalOpen(true);
        setHasShownPausePopup(true);
      }
    } else {
      setHasShownPausePopup(false);
    }
  }, [settings?.isOrderingPaused, hasShownPausePopup]);

  // Fetch Meals
  const { data: mealsData, isLoading: isLoadingMeals } = useQuery({
    queryKey: ['meals', activeCategory, debouncedSearch],
    queryFn: () => menuApi.getMeals({
      categoryId: activeCategory !== 'ALL' ? activeCategory : undefined,
      search: debouncedSearch || undefined
    }),
  });

  const meals = mealsData?.meals || [];

  const now = new Date();
  const currentHour = now.getHours();
  const isTimeClosed = currentHour < 5 || currentHour >= 20;
  const isOrderingPaused = settings?.isOrderingPaused;
  const isOrderingEnabled = !isTimeClosed && !isOrderingPaused;
  const closedMessage = isTimeClosed
    ? 'Canteen ordering is closed. Ordering opens at 5:00 AM.'
    : (settings?.pauseMessage || 'Ordering is temporarily paused.');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {(!isOrderingEnabled) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6 flex items-start shadow-sm">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-800 font-bold">Ordering Currently Unavailable</h3>
            <p className="text-red-700 text-sm mt-1">{closedMessage}</p>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
            Today's Menu
          </h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">
            Order your favorite meals instantly.
          </p>
        </div>

        <div className="w-full md:w-80 relative z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search delicious meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/95 backdrop-blur-xl border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-secondary-400/50 shadow-inner font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="relative mt-2">
        <div className="flex overflow-x-auto py-4 px-1 gap-3 hide-scrollbar snap-x">
          {isLoadingCategories ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0" />
            ))
          ) : (
            <>
              <button
                onClick={() => setActiveCategory('ALL')}
                className={cn(
                  "px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap snap-start border cursor-pointer",
                  activeCategory === 'ALL'
                    ? "bg-secondary-400 text-primary-950 border-secondary-400 shadow-[0_8px_20px_rgba(250,204,21,0.4)] transform -translate-y-1"
                    : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200 hover:border-gray-300 shadow-sm"
                )}
              >
                All Meals
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap snap-start border cursor-pointer",
                    activeCategory === category.id
                      ? "bg-secondary-400 text-primary-950 border-secondary-400 shadow-[0_8px_20px_rgba(250,204,21,0.4)] transform -translate-y-1"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200 hover:border-gray-300 shadow-sm"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Meals Grid */}
      {isLoadingMeals ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[22rem] bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm border border-gray-100">
              <Skeleton className="h-40 w-full rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 border-dashed text-center px-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No meals found</h3>
          <p className="text-gray-500 max-w-md">
            We couldn't find any meals matching your current filters. Try selecting a different category or adjusting your search.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
            className="mt-6 text-primary-600 font-semibold hover:text-primary-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {meals.map(meal => (
            <MealCard key={meal.id} meal={meal} isOrderingEnabled={isOrderingEnabled} />
          ))}
        </div>
      )}

      {/* Friendly Warning Alert Modal Popup */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 animate-bounce">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ordering Paused</h3>

              <p className="mt-4 text-gray-600 font-medium leading-relaxed">
                {settings?.pauseMessage || 'Canteen ordering is temporarily paused. Please check back soon!'}
              </p>
            </div>

            <div className="bg-gray-50 px-8 py-5 flex items-center justify-center border-t border-gray-100">
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-900/10 transition-all active:scale-[0.98] cursor-pointer"
              >
                Okay, Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
