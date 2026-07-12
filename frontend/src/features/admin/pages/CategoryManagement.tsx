import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ConfirmModal } from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import { Layers, Plus, Pencil, Trash2, Search, X } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyLimit: 0,
    isActive: true,
  });

  // Queries
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-all-categories'],
    queryFn: () => categoriesApi.getCategories(true), // get all categories, including inactive ones
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      toast.success('Category created successfully!');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to create category';
      toast.error(errMsg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully!');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to update category';
      toast.error(errMsg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted successfully!');
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to delete category';
      toast.error(errMsg);
      setCategoryToDelete(null);
    }
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      dailyLimit: 0,
      isActive: true,
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      dailyLimit: category.dailyLimit,
      isActive: category.isActive,
    });
    setShowFormModal(true);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">Categories Management</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Manage meal categories, daily limits, and service settings.</p>
        </div>

        <Button 
          onClick={handleOpenAddModal}
          className="relative z-10 bg-secondary-500 hover:bg-secondary-600 text-primary-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-secondary-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <Plus size={20} /> Add New Category
        </Button>
      </div>

      {/* Main Content */}
      <Card className="overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgb(0,0,0,0.04)] bg-white">
        
        {/* Search Row */}
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input 
              type="text"
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Description</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Daily Limit</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Current Orders</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-64" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Layers className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No categories found</p>
                      <p className="text-sm">Try adding a new category or adjusting your search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-5 text-gray-500 max-w-xs truncate">
                      {cat.description || <span className="text-gray-300 italic">No description</span>}
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-700">
                      {cat.dailyLimit > 0 ? (
                        `${cat.dailyLimit} items`
                      ) : (
                        <span className="text-gray-400 italic">Unlimited</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={cat.currentCount >= cat.dailyLimit && cat.dailyLimit > 0 ? "danger" : "default"}>
                        {cat.currentCount || 0} orders
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={cat.isActive ? "success" : "danger"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(cat)}
                          className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
                          title="Edit Category"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setCategoryToDelete(cat)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          title="Delete Category"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Layers className="text-primary-600" />
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button 
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-500 transition-colors cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Category Name *</label>
                <Input 
                  placeholder="e.g. Breakfast, Snacks" 
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Description</label>
                <textarea 
                  placeholder="Provide details about category serving time or contents..." 
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all resize-none h-24"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700 block">Daily Limit (Orders)</label>
                  <span className="text-xs text-gray-400 font-medium">Use 0 for unlimited orders</span>
                </div>
                <Input 
                  type="number"
                  placeholder="e.g. 50" 
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData(f => ({ ...f, dailyLimit: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Activate Category (Visible to customers on the menu)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={closeForm}
                  className="rounded-2xl px-5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-6"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
