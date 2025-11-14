'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('https://example.com');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
  });
  const postcardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!postcardRef.current) return;
    
    try {
      const canvas = await html2canvas(postcardRef.current, {
        scale: 2,
        backgroundColor: '#f5f0e8',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `postcard-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate postcard:', error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement order submission to backend
    console.log('Order submitted:', orderData);
    alert('订单提交成功！我们会尽快联系您。');
    setShowOrderModal(false);
    
    // Reset order form
    setOrderData({
      name: '',
      phone: '',
      address: '',
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-neutral-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif font-light text-stone-800 mb-3 tracking-wide">
            胶片明信片
          </h1>
          <p className="text-stone-600 text-lg font-light">创作你的复古回忆</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Control Panel */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-stone-200">
              <h2 className="text-2xl font-serif text-stone-800 mb-6">上传与创作</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    选择照片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-stone-600 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-stone-800 file:text-white hover:file:bg-stone-700 file:cursor-pointer cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    写下你的文字
                  </label>
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
                    二维码链接（如果没有个人网站，也可联系站长为您创建个人作品空间）
                  </label>
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-stone-400 focus:border-transparent text-stone-700 placeholder:text-stone-400 bg-white/80"
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!image}
                  className="w-full bg-stone-800 text-white py-4 px-6 rounded-full font-medium hover:bg-stone-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  下载明信片
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

          {/* Postcard Preview */}
          <div className="flex justify-center items-center">
            <div className="relative">
              <div 
                ref={postcardRef}
                className="bg-[#f5f0e8] p-8 rounded-3xl shadow-2xl relative"
                style={{ width: '480px' }}
              >
                <div className="bg-white p-6 rounded-2xl shadow-inner relative">
                  {image ? (
                    <div className="aspect-square bg-stone-200 rounded-xl overflow-hidden mb-6">
                      <img 
                        src={image} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center mb-6">
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
                        扫码查看<br/>摄影作品集
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
