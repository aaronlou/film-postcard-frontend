'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import { TemplateType } from '@/app/types/template';

interface Design {
  id: string;
  imageUrl: string;
  templateType: TemplateType;
  text: string;
  qrUrl: string;
  createdAt: string;
}

interface UserProfile {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  designCount: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile and designs in parallel
        const [profileRes, designsRes] = await Promise.all([
          fetch(API_ENDPOINTS.getUserProfile(username)),
          fetch(API_ENDPOINTS.getUserDesigns(username)),
        ]);

        if (!profileRes.ok || !designsRes.ok) {
          throw new Error('用户不存在');
        }

        const [profileData, designsData] = await Promise.all([
          profileRes.json(),
          designsRes.json(),
        ]);

        setProfile(profileData);
        setDesigns(designsData.designs || designsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  const getTemplateLabel = (type: TemplateType) => {
    const labels = {
      postcard: '明信片',
      bookmark: '书签',
      polaroid: '拍立得',
      greeting: '贺卡',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-stone-300 border-t-stone-800 mb-4"></div>
          <p className="text-stone-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-2xl font-serif text-stone-800 mb-2">用户未找到</h2>
          <p className="text-stone-600 mb-6">{error || '该用户不存在或已删除'}</p>
          <a
            href="/"
            className="inline-block bg-stone-800 text-white py-3 px-8 rounded-full font-medium hover:bg-stone-700 transition-all"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-stone-200 mb-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-stone-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-stone-300 flex items-center justify-center text-white text-3xl font-serif">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-light text-stone-800 mb-2">
                {profile.displayName}
              </h1>
              <p className="text-stone-500 mb-3">@{profile.username}</p>
              {profile.bio && (
                <p className="text-stone-600 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-stone-500">
                <span>{profile.designCount} 件作品</span>
              </div>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-serif text-stone-800 mb-6">作品集</h2>
        </div>

        {designs.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-stone-200 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-stone-500 text-lg mb-2">还没有作品</p>
            <p className="text-stone-400 text-sm">开始创作你的第一件作品吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-2xl transition-all group cursor-pointer"
              >
                {/* Design Preview */}
                <div className="relative aspect-square bg-stone-100 overflow-hidden">
                  <img
                    src={design.imageUrl}
                    alt={`${getTemplateLabel(design.templateType)} 作品`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Template Type Badge */}
                  <div className="absolute top-3 right-3 bg-stone-800/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    {getTemplateLabel(design.templateType)}
                  </div>
                </div>

                {/* Design Info */}
                <div className="p-4">
                  {design.text ? (
                    <p className="text-stone-700 text-sm line-clamp-2 mb-2 font-serif leading-relaxed">
                      {design.text}
                    </p>
                  ) : (
                    <p className="text-stone-400 text-sm italic mb-2">未添加文字</p>
                  )}
                  <p className="text-stone-400 text-xs">
                    {new Date(design.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block bg-stone-800 text-white py-4 px-8 rounded-full font-medium hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl"
          >
            创建你的作品
          </a>
        </div>
      </div>
    </div>
  );
}
