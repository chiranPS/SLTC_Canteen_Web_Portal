import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../../auth/api/auth.api';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { toast } from 'react-toastify';
import { User as UserIcon, Mail, BookOpen, ShieldCheck, Phone, CreditCard, MapPin } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    universityId: user?.universityId || '',
    phoneNumber: user?.phoneNumber || '',
    nic: user?.nic || '',
    address: user?.address || '',
  });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedUser = await authApi.updateProfile({
        name: formData.name,
        universityId: isAdmin ? undefined : formData.universityId,
        phoneNumber: formData.phoneNumber,
        nic: formData.nic,
        address: formData.address,
      });
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user?.name || '',
      universityId: user?.universityId || '',
      phoneNumber: user?.phoneNumber || '',
      nic: user?.nic || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">My Profile</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Manage your personal information.</p>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-100 to-primary-50 relative">
          <div className="absolute -bottom-12 left-8 h-24 w-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-primary-600">
            <UserIcon size={48} strokeWidth={1.5} />
          </div>
        </div>
        
        <CardContent className="p-8 pt-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-sm font-medium">{user.role}</span>
              </div>
            </div>
            
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserIcon size={16} /> Full Name
                </label>
                {isEditing ? (
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                    {user.name}
                  </div>
                )}
              </div>

              {!isAdmin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BookOpen size={16} /> University ID
                  </label>
                  {isEditing ? (
                    <Input 
                      name="universityId" 
                      value={formData.universityId} 
                      onChange={handleChange} 
                      placeholder="e.g., AA1234"
                      required
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                      {user.universityId || '-'}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                {isEditing ? (
                  <Input 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleChange} 
                    placeholder="e.g., +94 77 123 4567"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                    {user.phoneNumber || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard size={16} /> NIC
                </label>
                {isEditing ? (
                  <Input 
                    name="nic" 
                    value={formData.nic} 
                    onChange={handleChange} 
                    placeholder="National Identity Card Number"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                    {user.nic || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} /> Address
                </label>
                {isEditing ? (
                  <Input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                    {user.address || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Email Address (Read-only)
                </label>
                <div className="p-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-medium cursor-not-allowed">
                  {user.email}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <Button type="submit" isLoading={isLoading} className="flex-1 sm:flex-none">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1 sm:flex-none" disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
