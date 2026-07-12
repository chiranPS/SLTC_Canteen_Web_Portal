import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../../menu/api/menu.api';
import { adminApi } from '../api/admin.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Select } from '../../../components/ui/Select';
import { ConfirmModal } from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { getImageUrl } from '../../../utils/image';

export const MealManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [mealToDelete, setMealToDelete] = useState<any | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  });

  const { data: mealsData, isLoading } = useQuery({
    queryKey: ['admin-meals'],
    queryFn: () => menuApi.getMeals(),
  });

  const meals = mealsData?.meals || [];

  // Mutations
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string, isAvailable: boolean }) => 
      adminApi.updateMealAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
    },
    onError: () => toast.error('Failed to update availability')
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteMeal,
    onSuccess: () => {
      toast.success('Meal deleted successfully');
      setMealToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
    },
    onError: () => toast.error('Failed to delete meal')
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createMeal,
    onSuccess: () => {
      toast.success('Meal added successfully!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create meal');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: FormData }) => adminApi.updateMeal(id, data),
    onSuccess: () => {
      toast.success('Meal updated successfully!');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-meals'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update meal');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', categoryId: '', price: '', description: '' });
    setImageFile(null);
    setShowAddForm(false);
    setEditingMealId(null);
  };

  // Handlers
  const handleEditClick = (meal: any) => {
    setFormData({
      name: meal.name,
      categoryId: meal.categoryId,
      price: String(meal.price),
      description: meal.description || '',
    });
    setImageFile(null);
    setEditingMealId(meal.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDelete = (meal: any) => {
    setMealToDelete(meal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('categoryId', formData.categoryId);
    data.append('price', formData.price);
    if (formData.description) data.append('description', formData.description);
    if (imageFile) data.append('image', imageFile);

    if (editingMealId) {
      updateMutation.mutate({ id: editingMealId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meal.categoryId === selectedCategory;
    const matchesAvailability = selectedAvailability === 'all' 
      ? true 
      : selectedAvailability === 'available' 
        ? meal.isAvailable 
        : !meal.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const totalPages = Math.ceil(filteredMeals.length / limit) || 1;
  const paginatedMeals = filteredMeals.slice((page - 1) * limit, page * limit);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedAvailability]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <ConfirmModal
        isOpen={!!mealToDelete}
        title="Delete Meal"
        message={`Are you sure you want to permanently delete "${mealToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Meal"
        onConfirm={() => {
          if (mealToDelete) deleteMutation.mutate(mealToDelete.id);
        }}
        onCancel={() => setMealToDelete(null)}
        isLoading={deleteMutation.isPending}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">Meal Management</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Add, edit, and organize canteen items.</p>
        </div>
        <div className="relative z-10">
          <Button 
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }} 
            className="flex items-center gap-2 bg-secondary-400 text-primary-950 hover:bg-secondary-500 border-none shadow-[0_8px_20px_rgba(250,204,21,0.3)] transform transition-transform hover:-translate-y-1 font-bold px-6 py-6"
          >
            {showAddForm ? 'Cancel' : <><Plus size={20} /> Add New Meal</>}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="border-primary-100 shadow-xl shadow-primary-900/5 animate-in slide-in-from-top-4">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{editingMealId ? 'Edit Meal' : 'Create New Meal'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Meal Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="e.g. Chicken Fried Rice"
                />
                
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select 
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 outline-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <Input 
                  label="Price (Rs.)" 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                  placeholder="e.g. 450.00"
                />
                
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-semibold text-gray-700">Meal Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
                <textarea 
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 outline-none resize-y"
                  rows={3}
                  placeholder="Add a delicious description..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="w-full md:w-auto px-8"
                >
                  {editingMealId ? 'Update Meal' : 'Save Meal to Database'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900">All Meals</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-2xl md:justify-end">
            <Select
              className="w-full sm:w-48 h-9"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={[
                { label: 'All Categories', value: 'all' },
                ...categories.map(c => ({ label: c.name, value: c.id }))
              ]}
            />
            
            <Select
              className="w-full sm:w-40 h-9"
              value={selectedAvailability}
              onChange={(val) => setSelectedAvailability(val)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Available', value: 'available' },
                { label: 'Out of Stock', value: 'unavailable' }
              ]}
            />

            <div className="w-full sm:w-64">
              <Input 
                placeholder="Search meals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
                className="h-9"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Meal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedMeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No meals found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedMeals.map(meal => (
                  <tr key={meal.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          {meal.imageUrl ? (
                            <img className="h-full w-full object-cover" src={getImageUrl(meal.imageUrl)} alt="" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-gray-900">{meal.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-medium">
                        {meal.category.name}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      Rs. {Number(meal.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          toggleAvailabilityMutation.mutate({ 
                            id: meal.id, 
                            isAvailable: !meal.isAvailable 
                          });
                        }}
                        disabled={toggleAvailabilityMutation.isPending && toggleAvailabilityMutation.variables?.id === meal.id}
                        className={cn(
                          "px-3 py-1.5 inline-flex text-xs font-bold rounded-full border transition-all duration-200 shadow-sm",
                          meal.isAvailable 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200",
                          toggleAvailabilityMutation.isPending && toggleAvailabilityMutation.variables?.id === meal.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {meal.isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(meal)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(meal)} 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
            Showing <span className="font-bold text-gray-900">{filteredMeals.length === 0 ? 0 : (page - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, filteredMeals.length)}</span> of <span className="font-bold text-gray-900">{filteredMeals.length}</span> meals
          </p>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border-gray-200 px-3"
            >
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <div className="flex items-center gap-1 px-2 font-medium text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
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
