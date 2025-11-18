'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { TemplateType } from './types/template';
import TemplateSwitcher from './components/TemplateSwitcher';
import BookmarkTemplate from './components/templates/BookmarkTemplate';
import PolaroidTemplate from './components/templates/PolaroidTemplate';
import GreetingTemplate from './components/templates/GreetingTemplate';
import { QRCodeSVG } from 'qrcode.react';
import { API_ENDPOINTS } from './config/api';

export default function Home() {
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>('postcard');
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('https://example.com');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
  });
  const postcardRef = useRef<HTMLDivElement>(null);
  const postcardInnerRef = useRef<HTMLDivElement>(null);
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const polaroidRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  const templateRef = currentTemplate === 'postcard' ? postcardInnerRef :
    currentTemplate === 'bookmark' ? bookmarkRef :
      currentTemplate === 'polaroid' ? polaroidRef : greetingRef;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size - 30MB limit
    const MAX_SIZE = 30 * 1024 * 1024; // 30MB
    if (file.size > MAX_SIZE) {
      alert('图片大小不能超过30MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json();
      setUploadedImageId(data.imageId || data.id || data.url);
      
      // Update image with backend URL if provided
      if (data.url) {
        setImage(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('图片上传失败，请稍后再试');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDownload = async () => {
    if (!templateRef.current) return;

    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        // Improve color rendering
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
      });

      const link = document.createElement('a');
      const templateName = currentTemplate === 'postcard' ? 'postcard' :
        currentTemplate === 'bookmark' ? 'bookmark' :
          currentTemplate === 'polaroid' ? 'polaroid' : 'greeting';
      link.download = `${templateName}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();

      // Record download to backend for analytics (non-blocking)
      try {
        await fetch(API_ENDPOINTS.recordDownload, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: uploadedImageId,
            templateType: currentTemplate,
            text,
            qrUrl,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // Silent fail - don't interrupt user download experience
        console.error('Failed to record download:', error);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    try {
      const response = await fetch(API_ENDPOINTS.submitOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          imageId: uploadedImageId,
          templateType: currentTemplate,
          text,
          qrUrl,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Order submission failed');
      }
  
      alert('订单提交成功！我们会尽快联系您。');
      setShowOrderModal(false);
        
      // Reset order form
      setOrderData({
        name: '',
        phone: '',
        address: '',
        quantity: 1,
      });
    } catch (error) {
      console.error('Order submission error:', error);
      alert('订单提交失败，请稍后再试');
    }
  };

  const handlePolishText = async () => {
    if (!text.trim()) {
      alert('请先输入一些文字');
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch(API_ENDPOINTS.polishText, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          templateType: currentTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error('AI优化失败');
      }

      const data = await response.json();
      setText(data.polishedText);
    } catch (error) {
      console.error('Polish error:', error);
      alert('AI优化服务暂时不可用，请稍后再试');
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-serif font-light text-stone-800 mb-3 tracking-wide">
            胶片创作工坊
          </h1>
          <p className="text-stone-600 text-lg font-light">创作你的复古回忆</p>
        </header>

        <TemplateSwitcher
          currentTemplate={currentTemplate}
          onTemplateChange={setCurrentTemplate}
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-stone-200">
              <h2 className="text-2xl font-serif text-stone-800 mb-6">上传与创作</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    选择照片
                    {isUploadingImage && (
                      <span className="ml-2 text-xs text-stone-500 italic">上传中...</span>
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="block w-full text-sm text-stone-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-800 file:text-white hover:file:bg-stone-700 file:cursor-pointer cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-stone-700">
                      写下你的文字
                    </label>
                    <button
                      onClick={handlePolishText}
                      disabled={!text.trim() || isPolishing}
                      className="text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:text-stone-300 disabled:cursor-not-allowed italic"
                    >
                      {isPolishing ? '优化中...' : '✨ 让AI润色'}
                    </button>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="全世界的冰都会重逢\n北冰洋与尼罗河会在混云中交融"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-400 bg-white/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    二维码链接
                  </label>
                  <p className="text-xs text-stone-500 mb-2">
                    还没有个人作品空间？<a href="#" className="text-amber-600 hover:text-amber-700 underline">点击创建</a>你的专属页面（如：film.isnap.world/u/yourname）
                  </p>
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://film.isnap.world/u/yourname"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700 placeholder:text-stone-400 bg-white/80"
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!image}
                  className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {currentTemplate === 'postcard' ? '下载明信片' :
                    currentTemplate === 'bookmark' ? '下载书签' :
                      currentTemplate === 'polaroid' ? '下载拍立得' : '下载贺卡'}
                </button>

                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={!image}
                  className="w-full bg-white text-stone-800 py-4 px-6 rounded-full font-medium border-2 border-stone-800 hover:bg-stone-50 transition-all disabled:bg-stone-100 disabled:border-stone-300 disabled:text-stone-400 disabled:cursor-not-allowed"
                >
                  定制下单
                </button>
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="flex justify-center items-center">
            {currentTemplate === 'postcard' ? (
              <div className="relative">
                <div
                  ref={postcardRef}
                  className="bg-[#f5f0e8] p-8 rounded-3xl shadow-2xl relative"
                  style={{ width: '480px' }}
                >
                  <div ref={postcardInnerRef} className="bg-white p-6 rounded-2xl shadow-inner relative">
                    {image ? (
                      <div className="relative aspect-square bg-stone-200 rounded-xl overflow-hidden mb-6">
                        {/* Subtle film perforations on left */}
                        <div className="absolute left-1 top-0 bottom-0 w-1 flex flex-col justify-around py-4">
                          {[...Array(8)].map((_, i) => (
                            <div key={`l-${i}`} className="w-1 h-1 bg-stone-800/40 rounded-sm" />
                          ))}
                        </div>
                        {/* Subtle film perforations on right */}
                        <div className="absolute right-1 top-0 bottom-0 w-1 flex flex-col justify-around py-4">
                          {[...Array(8)].map((_, i) => (
                            <div key={`r-${i}`} className="w-1 h-1 bg-stone-800/40 rounded-sm" />
                          ))}
                        </div>
                        <img
                          src={image}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-stone-100 rounded-xl flex items-center justify-center mb-6">
                        <div className="text-center text-stone-400">
                          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-light">上传你的照片</p>
                        </div>
                      </div>
                    )}

                    {/* Bottom section with text and QR code side by side */}
                    <div className="flex items-start gap-4">
                      {/* Text area - left side */}
                      <div className="flex-1 text-left">
                        {text ? (
                          <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line font-serif">
                            {text}
                          </p>
                        ) : (
                          <p className="text-stone-400 text-xs font-light italic">
                            你的文字将显示在这里
                          </p>
                        )}
                      </div>

                      {/* QR code section - clean and simple */}
                      <div className="flex-shrink-0 text-center">
                        <div className="bg-white p-1.5 rounded shadow-sm border border-stone-200/50">
                          <QRCodeSVG
                            value={qrUrl}
                            size={44}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-[8px] text-stone-400 mt-1.5 leading-tight">
                          扫码查看<br />摄影作品集
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentTemplate === 'bookmark' ? (
              <BookmarkTemplate
                ref={bookmarkRef}
                data={{ image, text, qrUrl }}
              />
            ) : currentTemplate === 'polaroid' ? (
              <PolaroidTemplate
                ref={polaroidRef}
                data={{ image, text, qrUrl }}
              />
            ) : (
              <GreetingTemplate
                ref={greetingRef}
                data={{ image, text, qrUrl }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-stone-800">定制下单</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-5">
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
                    className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    提交订单
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="w-full bg-stone-100 text-stone-700 py-3 px-6 rounded-full font-medium hover:bg-stone-200 transition-all"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
