import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { getSystemSettings, updateSystemSettings } from '../../../shared/api/settings.api';
import { menuApi } from '../../menu/api/menu.api';
import { api } from '../../../config/api';
import { Power } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { Category } from '../../menu/types/menu.types';
import { toast } from 'react-toastify';

export const SystemSettingsPage = () => {
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [customPauseMessage, setCustomPauseMessage] = useState('');
  
  // local edits for limits
  const [limits, setLimits] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, categoriesRes] = await Promise.all([
        getSystemSettings(),
        menuApi.getCategories()
      ]);
      setSettings(settingsRes);
      setCategories(categoriesRes);
      
      const lims: Record<string, number> = {};
      categoriesRes.forEach(c => {
        lims[c.id] = c.dailyLimit;
      });
      setLimits(lims);
    } catch (error) {
      console.error('Error fetching settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPauseModal = () => {
    setCustomPauseMessage(settings?.pauseMessage || '');
    setIsPauseModalOpen(true);
  };

  const handlePauseConfirm = async () => {
    try {
      await updateSystemSettings(true, customPauseMessage);
      setIsPauseModalOpen(false);
      await fetchData();
      toast.success('Canteen ordering has been paused.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to pause ordering');
    }
  };

  const handleResume = async () => {
    try {
      await updateSystemSettings(false, '');
      await fetchData();
      toast.success('Canteen ordering has been resumed.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to resume ordering');
    }
  };

  const handleUpdateLimit = async (categoryId: string) => {
    try {
      // Create simple endpoint in menu.controller or just use a settings approach
      // For now, let's assume we add a PUT /api/v1/menu/categories/:id
      await api.put(`/menu/categories/${categoryId}`, {
        dailyLimit: Number(limits[categoryId])
      });
      toast.success('Limit updated successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update limit');
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.2)] border border-primary-800 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-48 h-48 bg-primary-500/30 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">System Configuration</h1>
          <p className="text-primary-100 mt-3 text-lg font-medium">Control global canteen settings and master switches.</p>
        </div>
      </div>

      {/* Global Controls */}
      <Card className="mb-8 border-red-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Power size={24} className={settings?.isOrderingPaused ? 'text-red-500' : 'text-green-500'} />
                Master Switch
              </h2>
              <p className="text-gray-500 mb-4 max-w-xl">
                Use this to pause all incoming orders. This will immediately block users from adding items to their cart or checking out.
              </p>
              
              {settings?.isOrderingPaused && settings.pauseMessage && (
                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl max-w-xl">
                  <span className="text-xs font-bold text-red-800 block uppercase tracking-wider mb-1">Active Warning Message:</span>
                  <span className="text-sm font-medium text-red-700">{settings.pauseMessage}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {settings?.isOrderingPaused ? (
                <>
                  <Button 
                    variant="secondary"
                    onClick={handleOpenPauseModal}
                    className="px-6 font-bold"
                  >
                    Edit Warning Message
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleResume}
                    className="px-8 font-bold"
                  >
                    Resume Orders
                  </Button>
                </>
              ) : (
                <Button 
                  variant="danger"
                  onClick={handleOpenPauseModal}
                  className="px-8 font-bold"
                >
                  Pause All Orders
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Limits */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Category Limits</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Card key={category.id} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{category.name}</h3>
                <Badge variant={(category.currentCount ?? 0) >= category.dailyLimit && category.dailyLimit > 0 ? 'danger' : 'success'}>
                  {category.currentCount} / {category.dailyLimit > 0 ? category.dailyLimit : '∞'} Sold
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Daily Limit</label>
                  <input 
                    type="number"
                    min="0"
                    value={limits[category.id] ?? 0}
                    onChange={(e) => setLimits(prev => ({ ...prev, [category.id]: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Set to 0 for unlimited</p>
                </div>
                <div className="flex items-end">
                  <Button variant="secondary" onClick={() => handleUpdateLimit(category.id)}>
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pause Admin Switch Modal Popup */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Power className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {settings?.isOrderingPaused ? 'Update Warning Message' : 'Pause Canteen Ordering'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    This message will be visible to all users browsing the canteen portal.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-sm font-semibold text-gray-700">
                    Pause Warning Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={customPauseMessage}
                    onChange={(e) => setCustomPauseMessage(e.target.value)}
                    placeholder="e.g. Canteen closed for maintenance. Ordering will resume at 2:00 PM."
                    className="flex w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 outline-none resize-none font-medium text-gray-800"
                  />
                  <p className="text-xs text-gray-400 font-medium">
                    Leave blank to use the default pause alert message.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100">
              <Button 
                variant="secondary" 
                onClick={() => setIsPauseModalOpen(false)}
                className="font-bold px-5"
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handlePauseConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 border-none shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
              >
                {settings?.isOrderingPaused ? 'Save Message' : 'Pause Ordering'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
