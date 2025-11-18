'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import { useAuth } from '@/app/context/AuthContext';

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
  albumId?: string; // 所属相册ID
}

interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  photoCount: number;
  createdAt: string;
}

interface PhotographerProfile {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  photoCount: number;
  website?: string;
  xiaohongshu?: string;
}

export default function PhotographerProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, refreshUser } = useAuth();
  
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null); // null = 全部作品
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    image: null as File | null,
    title: '',
    description: '',
    location: '',
    camera: '',
    lens: '',
    settings: '',
    takenAt: '',
    albumId: '', // 选择的相册ID
  });
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' });
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [showMovePhotoModal, setShowMovePhotoModal] = useState(false);
  const [movingPhoto, setMovingPhoto] = useState<Photo | null>(null);

  const isOwnProfile = currentUser && currentUser.username === username;

  const handleDeletePhoto = async (photoId: string) => {
    if (!currentUser || !confirm('确定要删除这张作品吗？此操作不可撤销。')) return;

    setDeletingPhotoId(photoId);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.deletePhoto(currentUser.username, photoId), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      const deletedPhoto = photos.find(p => p.id === photoId);

      // Remove from local state
      setPhotos(photos.filter(p => p.id !== photoId));
      
      // Update profile photo count
      setProfile(prev => prev ? {
        ...prev,
        photoCount: prev.photoCount - 1
      } : null);

      // Update album photo count if photo was in an album
      if (deletedPhoto?.albumId) {
        setAlbums(albums.map(album => 
          album.id === deletedPhoto.albumId 
            ? { ...album, photoCount: album.photoCount - 1 }
            : album
        ));
      }

      // Close lightbox if this photo was selected
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }

      alert('作品已删除');
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败，请稍后再试');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!currentUser || !confirm('确定要删除这个相册吗？相册内的作品将变为未分类。')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.deleteAlbum(currentUser.username, albumId), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Delete album failed');
      }

      // Remove album from state
      setAlbums(albums.filter(a => a.id !== albumId));
      
      // Clear albumId from photos in this album
      setPhotos(photos.map(photo => 
        photo.albumId === albumId 
          ? { ...photo, albumId: undefined }
          : photo
      ));

      // Clear selected album if it was deleted
      if (selectedAlbum === albumId) {
        setSelectedAlbum(null);
      }

      alert('相册已删除');
    } catch (error) {
      console.error('Delete album error:', error);
      alert('删除失败，请稍后再试');
    }
  };

  const handleMovePhoto = async (photoId: string, newAlbumId: string) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('auth_token');
      
      // TODO: 调用后端API移动作品
      const response = await fetch(API_ENDPOINTS.updatePhoto(currentUser.username, photoId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ albumId: newAlbumId || null }),
      });

      if (!response.ok) {
        throw new Error('Move photo failed');
      }

      const photo = photos.find(p => p.id === photoId);
      const oldAlbumId = photo?.albumId;

      // Update photo's albumId
      setPhotos(photos.map(p => 
        p.id === photoId 
          ? { ...p, albumId: newAlbumId || undefined }
          : p
      ));

      // Update album counts
      setAlbums(albums.map(album => {
        if (album.id === oldAlbumId) {
          return { ...album, photoCount: album.photoCount - 1 };
        }
        if (album.id === newAlbumId) {
          return { ...album, photoCount: album.photoCount + 1 };
        }
        return album;
      }));

      setShowMovePhotoModal(false);
      setMovingPhoto(null);
      alert('作品已移动');
    } catch (error) {
      console.error('Move photo error:', error);
      alert('移动失败，请稍后再试');
    }
  };

  const handleSetAlbumCover = async (albumId: string, photoUrl: string) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('auth_token');
      
      // TODO: 调用后端API设置封面
      const response = await fetch(API_ENDPOINTS.updateAlbum(currentUser.username, albumId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ coverPhoto: photoUrl }),
      });

      if (!response.ok) {
        throw new Error('Set cover failed');
      }

      // Update album cover in state
      setAlbums(albums.map(album => 
        album.id === albumId 
          ? { ...album, coverPhoto: photoUrl }
          : album
      ));

      alert('封面设置成功');
    } catch (error) {
      console.error('Set cover error:', error);
      alert('设置失败，请稍后再试');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type - only JPG/JPEG
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('只支持上传 JPG/JPEG 格式的图片');
      e.target.value = '';
      return;
    }

    // Validate file size - use tier limit (avatars typically use same limit as photos)
    const maxSize = currentUser.singleFileLimit || (10 * 1024 * 1024); // Default 10MB for FREE tier
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      alert(`头像大小不能超过${maxSizeMB}MB`);
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.uploadAvatar(currentUser.username), {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Avatar upload failed');
      }

      const updatedProfile = await response.json();
      
      // Update profile state with new avatar
      setProfile(prev => prev ? {
        ...prev,
        avatar: updatedProfile.avatarUrl || updatedProfile.avatar
      } : null);

      // Refresh auth context to persist avatar globally
      await refreshUser();

      alert('头像更新成功！');
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : '头像上传失败，请稍后再试';
      alert(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only JPG/JPEG
    const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('只支持上传 JPG/JPEG 格式的图片');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size against user's tier limit
    const maxSize = currentUser?.singleFileLimit || (10 * 1024 * 1024); // Default 10MB for FREE tier
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      alert(`图片大小不能超过${maxSizeMB}MB（您当前等级限制）`);
      e.target.value = ''; // Reset input
      return;
    }

    setUploadForm({ ...uploadForm, image: file });

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.image || !currentUser) return;

    // Check photo limit from user's tier
    const photoLimit = currentUser.photoLimit || 20; // Default FREE tier: 20 photos
    if (photos.length >= photoLimit) {
      const tierName = currentUser.userTier || 'FREE';
      alert(`已达到作品数量上限！您的 ${tierName} 等级最多可上传 ${photoLimit} 张作品。请删除一些旧作品后再上传，或升级会员。`);
      return;
    }

    setUploading(true);
    try {
      // First upload the image
      const formData = new FormData();
      formData.append('image', uploadForm.image);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const uploadRes = await fetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Image upload failed');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url || uploadData.imageUrl;

      // Then create the photo entry
      const photoData = {
        imageUrl,
        title: uploadForm.title || undefined,
        description: uploadForm.description || undefined,
        location: uploadForm.location || undefined,
        camera: uploadForm.camera || undefined,
        lens: uploadForm.lens || undefined,
        settings: uploadForm.settings || undefined,
        takenAt: uploadForm.takenAt || undefined,
      };

      // Save photo metadata to backend
      const saveRes = await fetch(API_ENDPOINTS.uploadPhoto(currentUser.username), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(photoData),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save photo metadata');
      }

      const savedPhoto = await saveRes.json();

      // Add to local state
      setPhotos([savedPhoto, ...photos]);
      setShowUploadModal(false);
      
      // Reset form
      setUploadForm({
        image: null,
        title: '',
        description: '',
        location: '',
        camera: '',
        lens: '',
        settings: '',
        takenAt: '',
        albumId: '',
      });
      setUploadPreview(null);

      // Refresh user data to update storage quota
      await refreshUser();

      alert('作品上传成功！');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : '上传失败，请稍后再试';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use mock data for demo if username is 'demo'
        if (username === 'demo') {
          setProfile({
            username: 'demo',
            displayName: 'Alex Chen',
            bio: 'Street photographer capturing moments of everyday beauty. Based in Tokyo & Shanghai.',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            photoCount: 12,
            xiaohongshu: 'https://www.xiaohongshu.com/user/profile/alexchen',
          });
          setPhotos([
            {
              id: '1',
              imageUrl: 'https://picsum.photos/800/1200?random=1',
              title: 'Golden Hour',
              location: 'Tokyo, Japan',
              camera: 'Leica M11',
              lens: 'Summilux 50mm f/1.4',
              settings: 'ISO 400, f/2.8, 1/500s',
              createdAt: '2025-11-15T10:00:00Z',
            },
            {
              id: '2',
              imageUrl: 'https://picsum.photos/800/600?random=2',
              title: 'Urban Reflections',
              location: 'Shanghai, China',
              camera: 'Fujifilm X-T5',
              lens: 'XF 35mm f/1.4',
              createdAt: '2025-11-14T15:30:00Z',
            },
            {
              id: '3',
              imageUrl: 'https://picsum.photos/600/900?random=3',
              title: 'Morning Light',
              location: 'Kyoto, Japan',
              createdAt: '2025-11-13T08:20:00Z',
            },
            {
              id: '4',
              imageUrl: 'https://picsum.photos/800/1000?random=4',
              title: 'Street Stories',
              location: 'Hong Kong',
              createdAt: '2025-11-12T18:45:00Z',
            },
            {
              id: '5',
              imageUrl: 'https://picsum.photos/700/1100?random=5',
              title: 'Silent Moments',
              location: 'Osaka, Japan',
              createdAt: '2025-11-11T12:10:00Z',
            },
            {
              id: '6',
              imageUrl: 'https://picsum.photos/800/800?random=6',
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
          fetch(API_ENDPOINTS.getUserPhotos(username)), // 获取摄影作品，不是卡片
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
          photoCount: profileData.photoCount || profileData.designCount,
        });
        setPhotos(photosData.photos || photosData); // 摄影作品数组
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
          <div className="flex items-center gap-6">
            {/* Back to Home Button */}
            <a
              href="/"
              className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-2"
              title="返回创作主页"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-xs font-light">主页</span>
            </a>

            <div className="flex items-center gap-4">
            {profile.avatar ? (
              <div className="relative group">
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className="w-10 h-10 rounded-full object-cover opacity-90"
                />
                {isOwnProfile && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,.jpg,.jpeg"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-sm font-light">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                {isOwnProfile && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,.jpg,.jpeg"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}
            <div>
                <h1 className="text-lg font-light tracking-wide">{profile.displayName}</h1>
                <p className="text-xs text-stone-500">@{profile.username}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-stone-500">
            <span>{profile.photoCount} works</span>
            {profile.xiaohongshu && (
              <a href={profile.xiaohongshu} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors">
                小红书
              </a>
            )}
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setShowAlbumModal(true)}
                  className="hover:text-stone-300 transition-colors"
                  title="创建相册组织作品"
                >
                  创建相册
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="hover:text-stone-300 transition-colors"
                  title={`已上传 ${profile.photoCount}/${currentUser?.photoLimit || 20} 张作品 | ${currentUser?.userTier || 'FREE'} 等级`}
                >
                  上传作品
                </button>
                <a href="#" className="hover:text-stone-300 transition-colors">
                  设置
                </a>
              </>
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

      {/* Album Filter Tabs */}
      {albums.length > 0 && (
        <div className="px-6 pt-32">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedAlbum(null)}
                className={`px-4 py-2 rounded-full text-xs font-light whitespace-nowrap transition-all ${
                  selectedAlbum === null
                    ? 'bg-white text-stone-900'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                全部作品 ({photos.length})
              </button>
              {albums.map((album) => (
                <div key={album.id} className="relative group">
                  <button
                    onClick={() => setSelectedAlbum(album.id)}
                    className={`px-4 py-2 rounded-full text-xs font-light whitespace-nowrap transition-all ${
                      selectedAlbum === album.id
                        ? 'bg-white text-stone-900'
                        : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {album.name} ({album.photoCount})
                  </button>
                  {/* Album actions - show on hover for own profile */}
                  {isOwnProfile && (
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => {
                          setEditingAlbum(album);
                          setAlbumForm({ name: album.name, description: album.description || '' });
                          setShowAlbumModal(true);
                        }}
                        className="bg-stone-700 hover:bg-stone-600 text-white p-1 rounded-full"
                        title="编辑相册"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                        title="删除相册"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid - Masonry Layout */}
      <div className="px-6 pb-20 pt-32">
        {(() => {
          // 过滤照片：根据选中的相册
          const filteredPhotos = selectedAlbum
            ? photos.filter(photo => photo.albumId === selectedAlbum)
            : photos;

          if (filteredPhotos.length === 0) {
            return (
              <div className="text-center py-32">
                <p className="text-stone-600 text-sm font-light">
                  {selectedAlbum ? '该相册暂无作品' : 'No works yet'}
                </p>
              </div>
            );
          }

          return (
            <div className="max-w-7xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid group cursor-pointer relative"
              >
                <div className="relative overflow-hidden bg-stone-900" onClick={() => setSelectedPhoto(photo)}>
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
                {/* Delete button - only for own profile */}
                {isOwnProfile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    disabled={deletingPhotoId === photo.id}
                    className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 z-10"
                    title="删除作品"
                  >
                    {deletingPhotoId === photo.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              ))}
            </div>
          );
        })()}
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

          {/* Delete button - only for own profile */}
          {isOwnProfile && (
            <button
              onClick={() => handleDeletePhoto(selectedPhoto.id)}
              disabled={deletingPhotoId === selectedPhoto.id}
              className="absolute top-6 right-20 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deletingPhotoId === selectedPhoto.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm font-light">删除中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-light">删除</span>
                </>
              )}
            </button>
          )}

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

              {/* Photo Actions - only for own profile */}
              {isOwnProfile && (
                <div className="pt-4 border-t border-stone-800 space-y-2">
                  {/* Move to album */}
                  {albums.length > 0 && (
                    <button
                      onClick={() => {
                        setMovingPhoto(selectedPhoto);
                        setShowMovePhotoModal(true);
                      }}
                      className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 py-2 px-4 rounded text-xs font-light transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      移动到相册
                    </button>
                  )}
                  {/* Set as album cover */}
                  {selectedPhoto.albumId && (
                    <button
                      onClick={() => handleSetAlbumCover(selectedPhoto.albumId!, selectedPhoto.imageUrl)}
                      className="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 py-2 px-4 rounded text-xs font-light transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      设为相册封面
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-900 py-12 text-center">
        <p className="text-stone-600 text-xs font-light tracking-wider">© {new Date().getFullYear()} {profile.displayName}</p>
      </footer>

      {/* Upload Modal */}
      {showUploadModal && isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-stone-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-light text-white">上传摄影作品</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    已上传 {photos.length}/{currentUser?.photoLimit || 20} 张作品
                    {currentUser?.storageUsed !== undefined && currentUser?.storageLimit && (
                      <span className="ml-3">
                        已使用 {((currentUser.storageUsed || 0) / (1024 * 1024)).toFixed(1)}MB / {((currentUser.storageLimit) / (1024 * 1024)).toFixed(0)}MB
                        <span className={`ml-2 text-xs ${
                          ((currentUser.storageUsed || 0) / currentUser.storageLimit) >= 0.9 ? 'text-red-400' :
                          ((currentUser.storageUsed || 0) / currentUser.storageLimit) >= 0.75 ? 'text-orange-400' :
                          'text-green-400'
                        }`}>
                          ({Math.round(((currentUser.storageUsed || 0) / currentUser.storageLimit) * 100)}%)
                        </span>
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadPreview(null);
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-stone-400 text-xs mb-3 font-light tracking-wide">
                    选择照片 * <span className="text-stone-600">(仅支持 JPG 格式，最大 {((currentUser?.singleFileLimit || 10 * 1024 * 1024) / (1024 * 1024)).toFixed(0)}MB)</span>
                  </label>
                  {uploadPreview ? (
                    <div className="relative aspect-video bg-stone-800 rounded overflow-hidden mb-3">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadForm({ ...uploadForm, image: null });
                          setUploadPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded hover:bg-black/70 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,.jpg,.jpeg"
                      onChange={handleImageSelect}
                      required
                      className="block w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-stone-800 file:text-stone-300 hover:file:bg-stone-700 file:cursor-pointer cursor-pointer"
                    />
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                    标题
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                    placeholder="Golden Hour"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                    描述
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors resize-none"
                    placeholder="A beautiful moment captured..."
                  />
                </div>

                {/* Location & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                      拍摄地点
                    </label>
                    <input
                      type="text"
                      value={uploadForm.location}
                      onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                      placeholder="Tokyo, Japan"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                      拍摄日期
                    </label>
                    <input
                      type="date"
                      value={uploadForm.takenAt}
                      onChange={(e) => setUploadForm({ ...uploadForm, takenAt: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Camera & Lens */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                      相机
                    </label>
                    <input
                      type="text"
                      value={uploadForm.camera}
                      onChange={(e) => setUploadForm({ ...uploadForm, camera: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                      placeholder="Leica M11"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                      镜头
                    </label>
                    <input
                      type="text"
                      value={uploadForm.lens}
                      onChange={(e) => setUploadForm({ ...uploadForm, lens: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                      placeholder="50mm f/1.4"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                    拍摄参数
                  </label>
                  <input
                    type="text"
                    value={uploadForm.settings}
                    onChange={(e) => setUploadForm({ ...uploadForm, settings: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                    placeholder="ISO 400, f/2.8, 1/500s"
                  />
                </div>

                {/* Album Selection */}
                {albums.length > 0 && (
                  <div>
                    <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                      选择相册（可选）
                    </label>
                    <select
                      value={uploadForm.albumId}
                      onChange={(e) => setUploadForm({ ...uploadForm, albumId: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                    >
                      <option value="">不分类（默认）</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading || !uploadForm.image}
                    className="flex-1 bg-white text-black py-3 rounded font-light text-sm hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? '上传中...' : '上传作品'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadPreview(null);
                    }}
                    className="px-6 bg-stone-800 text-stone-300 py-3 rounded font-light text-sm hover:bg-stone-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Album Modal */}
      {showAlbumModal && isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-stone-900 rounded-lg max-w-md w-full">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">{editingAlbum ? '编辑相册' : '创建相册'}</h2>
                <button
                  onClick={() => {
                    setShowAlbumModal(false);
                    setAlbumForm({ name: '', description: '' });
                    setEditingAlbum(null);
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!albumForm.name.trim()) return;

                  if (editingAlbum) {
                    // 编辑相册
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(API_ENDPOINTS.updateAlbum(currentUser!.username, editingAlbum.id), {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ 
                        name: albumForm.name, 
                        description: albumForm.description 
                      }),
                    });

                    if (response.ok) {
                      setAlbums(albums.map(album => 
                        album.id === editingAlbum.id
                          ? { ...album, name: albumForm.name, description: albumForm.description }
                          : album
                      ));
                      alert('相册更新成功！');
                    }
                  } else {
                    // 创建相册
                    const newAlbum: Album = {
                      id: `album-${Date.now()}`,
                      name: albumForm.name,
                      description: albumForm.description,
                      photoCount: 0,
                      createdAt: new Date().toISOString(),
                    };
                    setAlbums([...albums, newAlbum]);
                    alert('相册创建成功！');
                  }
                  
                  setShowAlbumModal(false);
                  setAlbumForm({ name: '', description: '' });
                  setEditingAlbum(null);
                }}
                className="space-y-6"
              >
                {/* Album Name */}
                <div>
                  <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                    相册名称 *
                  </label>
                  <input
                    type="text"
                    value={albumForm.name}
                    onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
                    required
                    maxLength={30}
                    className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors"
                    placeholder="例：京都的秋天、日常生活、人像摄影"
                  />
                </div>

                {/* Album Description */}
                <div>
                  <label className="block text-stone-400 text-xs mb-2 font-light tracking-wide">
                    相册描述（可选）
                  </label>
                  <textarea
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    rows={3}
                    maxLength={200}
                    className="w-full bg-stone-800 border border-stone-700 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-stone-500 transition-colors resize-none"
                    placeholder="简要描述这个相册的主题或故事..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!albumForm.name.trim()}
                    className="flex-1 bg-white text-black py-3 rounded font-light text-sm hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingAlbum ? '保存更改' : '创建相册'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAlbumModal(false);
                      setAlbumForm({ name: '', description: '' });
                      setEditingAlbum(null);
                    }}
                    className="px-6 bg-stone-800 text-stone-300 py-3 rounded font-light text-sm hover:bg-stone-700 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Move Photo to Album Modal */}
      {showMovePhotoModal && movingPhoto && isOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-stone-900 rounded-lg max-w-md w-full">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">移动到相册</h2>
                <button
                  onClick={() => {
                    setShowMovePhotoModal(false);
                    setMovingPhoto(null);
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current album info */}
              <div className="mb-6 p-4 bg-stone-800 rounded">
                <p className="text-xs text-stone-400 mb-1">当前所在相册：</p>
                <p className="text-sm text-white font-light">
                  {movingPhoto.albumId 
                    ? albums.find(a => a.id === movingPhoto.albumId)?.name || '未知相册'
                    : '未分类'
                  }
                </p>
              </div>

              {/* Album list */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => handleMovePhoto(movingPhoto.id, '')}
                  className={`w-full text-left px-4 py-3 rounded transition-colors ${
                    !movingPhoto.albumId
                      ? 'bg-stone-700 text-white'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <p className="text-sm font-light">未分类</p>
                      <p className="text-xs text-stone-500">移除相册分类</p>
                    </div>
                  </div>
                </button>

                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => handleMovePhoto(movingPhoto.id, album.id)}
                    disabled={movingPhoto.albumId === album.id}
                    className={`w-full text-left px-4 py-3 rounded transition-colors ${
                      movingPhoto.albumId === album.id
                        ? 'bg-stone-700 text-white cursor-not-allowed'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-light">{album.name}</p>
                        <p className="text-xs text-stone-500">{album.photoCount} 张作品</p>
                      </div>
                      {movingPhoto.albumId === album.id && (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Cancel button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowMovePhotoModal(false);
                    setMovingPhoto(null);
                  }}
                  className="w-full bg-stone-800 text-stone-300 py-3 rounded font-light text-sm hover:bg-stone-700 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
