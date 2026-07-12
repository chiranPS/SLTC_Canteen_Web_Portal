import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ConfirmModal } from '../../../components/ui/Modal';
import { toast } from 'react-toastify';
import { Users, Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import type { AdminUser } from '../types/users.types';

export const AdminManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    email: '',
    password: '',
    phoneNumber: '',
    nic: '',
  });

  // Queries
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => usersApi.getAllAdmins(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: usersApi.createAdmin,
    onSuccess: () => {
      toast.success('Admin created successfully!');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to create admin';
      toast.error(errMsg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => usersApi.updateAdmin(id, data),
    onSuccess: () => {
      toast.success('Admin updated successfully!');
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to update admin';
      toast.error(errMsg);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteAdmin,
    onSuccess: () => {
      toast.success('Admin deleted successfully!');
      setAdminToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || 'Failed to delete admin';
      toast.error(errMsg);
      setAdminToDelete(null);
    }
  });

  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      universityId: '',
      email: '',
      password: '',
      phoneNumber: '',
      nic: '',
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      universityId: admin.universityId,
      email: admin.email,
      password: '', // blank unless they want to update it
      phoneNumber: admin.phoneNumber || '',
      nic: admin.nic || '',
    });
    setShowFormModal(true);
  };

  const closeForm = () => {
    setShowFormModal(false);
    setEditingAdmin(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.universityId.trim()) {
      toast.error('Name, Email, and University ID are required');
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      toast.error('Password is required for new admins');
      return;
    }

    const submitData: any = {
      name: formData.name,
      email: formData.email,
      universityId: formData.universityId,
      phoneNumber: formData.phoneNumber,
      nic: formData.nic,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    if (editingAdmin) {
      updateMutation.mutate({
        id: editingAdmin.id,
        data: submitData
      });
    } else {
      createMutation.mutate(submitData as any);
    }
  };

  const filteredAdmins = admins.filter((admin: AdminUser) =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.universityId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">Admin Users</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Manage administrators for the canteen portal.</p>
        </div>

        <Button 
          onClick={handleOpenAddModal}
          className="relative z-10 bg-secondary-500 hover:bg-secondary-600 text-primary-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-secondary-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <Plus size={20} /> Add New Admin
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
              placeholder="Search admins by name, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">University ID</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-6 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No admins found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin: AdminUser) => (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-5 text-gray-500">
                      {admin.email}
                    </td>
                    <td className="px-6 py-5 text-gray-500">
                      {admin.universityId}
                    </td>
                    <td className="px-6 py-5 text-gray-500">
                      {admin.phoneNumber || <span className="italic text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditModal(admin)}
                          className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl"
                          title="Edit Admin"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setAdminToDelete(admin)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          title="Delete Admin"
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
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Users className="text-primary-600" />
                {editingAdmin ? 'Edit Admin' : 'Create Admin'}
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
                <label className="text-sm font-bold text-gray-700 block">Name *</label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Email *</label>
                <Input 
                  type="email"
                  placeholder="admin@sltc.ac.lk" 
                  value={formData.email}
                  onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">University ID *</label>
                <Input 
                  placeholder="e.g. EMP001" 
                  value={formData.universityId}
                  onChange={(e) => setFormData(f => ({ ...f, universityId: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Password {editingAdmin ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <Input 
                  type="password"
                  placeholder="********" 
                  value={formData.password}
                  onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                  required={!editingAdmin}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Phone Number</label>
                <Input 
                  placeholder="+94..." 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(f => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">NIC</label>
                <Input 
                  placeholder="..." 
                  value={formData.nic}
                  onChange={(e) => setFormData(f => ({ ...f, nic: e.target.value }))}
                />
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
                  {editingAdmin ? 'Save Changes' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!adminToDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete the admin "${adminToDelete?.name}"? This action is permanent and cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          if (adminToDelete) {
            deleteMutation.mutate(adminToDelete.id);
          }
        }}
        onCancel={() => setAdminToDelete(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
