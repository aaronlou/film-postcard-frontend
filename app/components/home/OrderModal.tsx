import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

interface OrderData {
  name: string;
  phone: string;
  address: string;
  quantity: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedImageId: string | null;
  templateType: string;
  text: string;
  qrUrl: string;
}

export default function OrderModal({
  isOpen,
  onClose,
  uploadedImageId,
  templateType,
  text,
  qrUrl,
}: OrderModalProps) {
  const [orderData, setOrderData] = useState<OrderData>({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.submitOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          imageId: uploadedImageId,
          templateType,
          text,
          qrUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Order submission failed');
      }

      toast.success('订单提交成功！我们会尽快联系您。');
      onClose();
      
      // Reset order form
      setOrderData({
        name: '',
        phone: '',
        address: '',
        quantity: 1,
      });
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('订单提交失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-stone-800">定制下单</h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                required
                value={orderData.name}
                onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
                placeholder="请输入您的姓名"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                required
                value={orderData.phone}
                onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                placeholder="请输入手机号码"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                收货地址
              </label>
              <textarea
                required
                value={orderData.address}
                onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                placeholder="请输入详细收货地址"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                定制数量
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={orderData.quantity}
                onChange={(e) => setOrderData({ ...orderData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700"
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '提交中...' : '提交订单'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-stone-100 text-stone-700 py-3 px-6 rounded-full font-medium hover:bg-stone-200 transition-all"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
