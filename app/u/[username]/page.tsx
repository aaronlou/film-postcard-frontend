'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';

interface Photo {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  takenAt?: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  createdAt: string;
}

interface PhotographerProfile {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  photoCount: number;
  website?: string;
  instagram?: string;
}

export default function PhotographerProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use mock data for demo if username is 'demo'
        if (username === 'demo') {
          setProfile({
            username: 'demo',
            displayName: 'Alex Chen',
            bio: 'Street photographer capturing moments of everyday beauty. Based in Tokyo & Shanghai.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            photoCount: 12,
            instagram: 'https://instagram.com/alexchen',
          });
          setPhotos([
            {
              id: '1',
              imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
              title: 'Golden Hour',
              location: 'Tokyo, Japan',
              camera: 'Leica M11',
              lens: 'Summilux 50mm f/1.4',
              settings: 'ISO 400, f/2.8, 1/500s',
              createdAt: '2025-11-15T10:00:00Z',
            },
            {
              id: '2',
              imageUrl: 'https://images.unsplash.com/photo-1682687221038-404cb8830901',
              title: 'Urban Reflections',
              location: 'Shanghai, China',
              camera: 'Fujifilm X-T5',
              lens: 'XF 35mm f/1.4',
              createdAt: '2025-11-14T15:30:00Z',
            },
            {
              id: '3',
              imageUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
              title: 'Morning Light',
              location: 'Kyoto, Japan',
              createdAt: '2025-11-13T08:20:00Z',
            },
            {
              id: '4',
              imageUrl: 'https://images.unsplash.com/photo-1682687220798-2c5e3f04c0e1',
              title: 'Street Stories',
              location: 'Hong Kong',
              createdAt: '2025-11-12T18:45:00Z',
            },
            {
              id: '5',
              imageUrl: 'https://images.unsplash.com/photo-1682687221080-5cb261c645cb',
              title: 'Silent Moments',
              location: 'Osaka, Japan',
              createdAt: '2025-11-11T12:10:00Z',
            },
            {
              id: '6',
              imageUrl: 'https://images.unsplash.com/photo-1682687220866-c856f566f1bd',
              title: 'City Lights',
              location: 'Seoul, Korea',
              createdAt: '2025-11-10T20:30:00Z',
            },
          ]);
          setLoading(false);
          return;
        }

        const [profileRes, photosRes] = await Promise.all([
          fetch(API_ENDPOINTS.getUserProfile(username)),
          fetch(API_ENDPOINTS.getUserDesigns(username)),
        ]);

        if (!profileRes.ok || !photosRes.ok) {
          throw new Error('用户不存在');
        }

        const [profileData, photosData] = await Promise.all([
          profileRes.json(),
          photosRes.json(),
        ]);

        setProfile({
          ...profileData,
          photoCount: profileData.designCount || profileData.photoCount,
        });
        setPhotos(photosData.designs || photosData.photos || photosData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-stone-600 border-t-stone-300 mb-4"></div>
          <p className="text-stone-400 text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-light text-stone-300 mb-3">Not Found</h2>
          <p className="text-stone-500 mb-8 text-sm">{error || 'This photographer does not exist'}</p>
          <a
            href="/"
            className="text-stone-400 hover:text-stone-200 text-sm font-light transition-colors border-b border-stone-700 hover:border-stone-400 pb-1"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Minimal Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="w-10 h-10 rounded-full object-cover opacity-90"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-sm font-light">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-light tracking-wide">{profile.displayName}</h1>
              <p className="text-xs text-stone-500">@{profile.username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-stone-500">
            <span>{profile.photoCount} works</span>
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors">
                Instagram
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Bio Section */}
      {profile.bio && (
        <div className="pt-32 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-stone-400 text-base font-light leading-relaxed tracking-wide">
              {profile.bio}
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid - Masonry Layout */}
      <div className="px-6 pb-20 pt-8">
        {photos.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-stone-600 text-sm font-light">No works yet</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative overflow-hidden bg-stone-900">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || 'Photography work'}
                    className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {photo.title && (
                        <p className="text-white text-sm font-light mb-1">{photo.title}</p>
                      )}
                      {photo.location && (
                        <p className="text-stone-400 text-xs font-light">{photo.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            <div className="flex-1 max-h-[80vh] flex items-center justify-center">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || 'Photo'}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Photo Info */}
            <div className="md:w-80 text-left space-y-4">
              {selectedPhoto.title && (
                <h3 className="text-xl font-light text-white">{selectedPhoto.title}</h3>
              )}
              {selectedPhoto.description && (
                <p className="text-stone-400 text-sm font-light leading-relaxed">
                  {selectedPhoto.description}
                </p>
              )}
              
              <div className="pt-4 border-t border-stone-800 space-y-2 text-xs text-stone-500 font-light">
                {selectedPhoto.takenAt && (
                  <div>
                    <span className="text-stone-600">Date:</span> {new Date(selectedPhoto.takenAt).toLocaleDateString()}
                  </div>
                )}
                {selectedPhoto.location && (
                  <div>
                    <span className="text-stone-600">Location:</span> {selectedPhoto.location}
                  </div>
                )}
                {selectedPhoto.camera && (
                  <div>
                    <span className="text-stone-600">Camera:</span> {selectedPhoto.camera}
                  </div>
                )}
                {selectedPhoto.lens && (
                  <div>
                    <span className="text-stone-600">Lens:</span> {selectedPhoto.lens}
                  </div>
                )}
                {selectedPhoto.settings && (
                  <div>
                    <span className="text-stone-600">Settings:</span> {selectedPhoto.settings}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 py-12 text-center">
        <p className="text-stone-600 text-xs font-light tracking-wider">© {new Date().getFullYear()} {profile.displayName}</p>
      </footer>
    </div>
  );
}
