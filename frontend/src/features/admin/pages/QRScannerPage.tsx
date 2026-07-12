import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, XCircle, RefreshCw, ScanLine } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import type { Order } from '../../orders/types/orders.types';

export const QRScannerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const decodeMutation = useMutation({
    mutationFn: adminApi.decodeQr,
    onSuccess: (order) => {
      setScannedOrder(order);
      setErrorMsg(null);
      setIsScanning(false);
      toast.success('Order found!');
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Invalid or Expired QR Code');
      setScannedOrder(null);
      setIsScanning(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => adminApi.updateOrderStatus(scannedOrder!.id, 'COLLECTED'),
    onSuccess: () => {
      toast.success('Order marked as Collected!');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      resetScanner();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete order');
    }
  });

  const handleScan = (text: string) => {
    if (text && isScanning && !decodeMutation.isPending) {
      decodeMutation.mutate(text);
    }
  };

  const resetScanner = () => {
    setScannedOrder(null);
    setErrorMsg(null);
    setIsScanning(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <ScanLine className="text-primary-600" size={32} /> QR Scanner (POS)
        </h1>
        <p className="text-gray-500 text-lg mt-2">Scan a student's QR code to verify and collect their order.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Feed */}
        <Card className="overflow-hidden bg-black border-0 shadow-xl relative min-h-[400px] flex items-center justify-center rounded-3xl">
          {isScanning ? (
            <div className="w-full h-full relative">
              <Scanner
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    handleScan(detectedCodes[0].rawValue);
                  }
                }}
                onError={(error) => console.log(error?.message)}
                scanDelay={2000}
                allowMultiple={true}
              />
              <div className="absolute inset-0 border-8 border-primary-500/30 rounded-3xl pointer-events-none" />
              {decodeMutation.isPending && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="animate-spin text-white w-10 h-10" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 p-8 text-center space-y-4">
              {errorMsg ? (
                <>
                  <XCircle className="text-red-500 w-16 h-16 mb-2" />
                  <h3 className="text-xl font-bold">Scan Failed</h3>
                  <p className="text-red-400">{errorMsg}</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="text-green-500 w-16 h-16 mb-2" />
                  <h3 className="text-xl font-bold">Order Verified</h3>
                  <p className="text-green-400">Please confirm details below.</p>
                </>
              )}
              <Button onClick={resetScanner} variant="secondary" className="mt-4">
                Scan Another QR
              </Button>
            </div>
          )}
        </Card>

        {/* Order Details Panel */}
        <Card className="shadow-lg border-0 bg-gray-50/50 rounded-3xl h-full flex flex-col">
          {scannedOrder ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 bg-white rounded-t-3xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
                    <h2 className="text-3xl font-black text-gray-900">#{scannedOrder.orderNumber}</h2>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {scannedOrder.status}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 font-medium">
                  Placed at: {format(new Date(scannedOrder.createdAt), 'MMM dd, h:mm a')}
                </p>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Order Items</h3>
                <ul className="space-y-4">
                  {scannedOrder.orderItems.map((item: any) => (
                    <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary-100 text-primary-800 font-black px-2 py-1 rounded text-sm">
                          {item.quantity}x
                        </span>
                        <span className="font-semibold text-gray-800">{item.meal.name}</span>
                      </div>
                      <span className="font-bold text-gray-600">Rs. {(item.quantity * Number(item.unitPrice)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-white border-t border-gray-200 rounded-b-3xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-500">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">Rs. {Number(scannedOrder.totalAmount).toFixed(2)}</span>
                </div>
                <Button 
                  onClick={() => completeMutation.mutate()} 
                  isLoading={completeMutation.isPending}
                  className="w-full h-14 text-lg font-bold shadow-primary-900/20"
                >
                  <CheckCircle2 className="mr-2" /> Mark as Collected
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <ScanLine className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Waiting for Scan</h3>
              <p className="text-sm">Scan a QR code using the camera to view order details and collect it.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
