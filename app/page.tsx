'use client';

import { useState, useRef, useEffect } from 'react';
import { TemplateType } from './types/template';
import TemplateSwitcher from './components/TemplateSwitcher';
import { useAuth } from './context/AuthContext';
import { toast } from 'sonner';
import { API_ENDPOINTS } from './config/api';

// New Components
import ControlPanel from './components/home/ControlPanel';
import PreviewSection from './components/home/PreviewSection';
import OrderModal from './components/home/OrderModal';

// Custom Hooks
import { useImageUpload } from './hooks/useImageUpload';
import { usePostcardGenerator } from './hooks/usePostcardGenerator';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>('postcard');
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('https://example.com');
  const [isPolishing, setIsPolishing] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Refs for capturing content
  const contentRef = useRef<HTMLDivElement>(null);

  // Custom Hooks
  const {
    image,
    uploadedImageId,
    isUploadingImage,
    handleImageUpload
  } = useImageUpload();

  const { handleDownload } = usePostcardGenerator({
    currentTemplate,
    contentRef,
    uploadedImageId,
    text,
    qrUrl,
  });

  // Auto-fill user's personal homepage URL when authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.username) {
      const personalUrl = `https://film.isnap.world/u/${user.username}`;
      setQrUrl(personalUrl);
    }
  }, [isAuthenticated, user]);

  const handlePolishText = async () => {
    if (!text.trim()) {
      toast.warning('请先输入一些文字');
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
      toast.success('AI润色完成');
    } catch (error) {
      console.error('Polish error:', error);
      toast.error('AI优化服务暂时不可用，请稍后再试');
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 sm:py-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6 sm:mb-8 relative">
          {/* User Menu - Top Right */}
          <div className="absolute top-0 right-0 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            {isAuthenticated && user ? (
              <>
                <a
                  href={`/u/${user.username}`}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 backdrop-blur-sm border border-stone-200 hover:bg-white hover:shadow-md transition-all group"
                  title="查看我的为个人主页"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-stone-200 group-hover:ring-stone-400 transition-all"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-stone-300 flex items-center justify-center text-white text-xs ring-2 ring-stone-200 group-hover:ring-stone-400 transition-all">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-stone-800">{user.displayName}</span>
                    <span className="text-xs text-stone-500">个人主页</span>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-stone-400 group-hover:text-stone-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <button
                  onClick={logout}
                  className="hidden sm:block text-xs text-stone-400 hover:text-stone-600 transition-colors px-3 py-2 rounded-full hover:bg-stone-100"
                >
                  退出
                </button>
              </>
            ) : (
              <a
                href="/auth"
                className="text-xs sm:text-sm text-stone-600 hover:text-stone-800 transition-colors font-light border-b border-stone-400 hover:border-stone-800 pb-0.5"
              >
                登录
              </a>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-stone-800 mb-2 sm:mb-3 tracking-wide">
            胶片创作工坊
          </h1>
          <p className="text-stone-600 text-base sm:text-lg font-light">创作你的复古回忆</p>
        </header>

        <TemplateSwitcher
          currentTemplate={currentTemplate}
          onTemplateChange={setCurrentTemplate}
        />

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Control Panel */}
          <ControlPanel
            currentTemplate={currentTemplate}
            text={text}
            setText={setText}
            qrUrl={qrUrl}
            setQrUrl={setQrUrl}
            onImageUpload={handleImageUpload}
            isUploadingImage={isUploadingImage}
            image={image}
            onDownload={handleDownload}
            onOrderClick={() => setShowOrderModal(true)}
            isPolishing={isPolishing}
            handlePolishText={handlePolishText}
          />

          {/* Template Preview */}
          <PreviewSection
            currentTemplate={currentTemplate}
            image={image}
            text={text}
            qrUrl={qrUrl}
            contentRef={contentRef}
          />
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        uploadedImageId={uploadedImageId}
        templateType={currentTemplate}
        text={text}
        qrUrl={qrUrl}
      />
    </div>
  );
}
