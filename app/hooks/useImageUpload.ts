import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'sonner';

export function useImageUpload() {
    const { user } = useAuth();
    const [image, setImage] = useState<string | null>(null);
    const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Cleanup object URL on unmount or when image changes
    useEffect(() => {
        return () => {
            if (image && image.startsWith('blob:')) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 🔒 Check authentication first
        const token = localStorage.getItem('auth_token');
        if (!token || !user) {
            toast.error('请先登录后再上传图片');
            // Reset file input
            e.target.value = '';
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/auth';
            }, 1500);
            return;
        }

        // Validate file size - use user's tier limit
        const maxSize = user?.singleFileLimit || (10 * 1024 * 1024); // Default 10MB for FREE
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
            const tierName = user?.userTier || 'FREE';
            toast.error(`图片大小不能超过${maxSizeMB}MB（${tierName} 等级限制）`);
            return;
        }

        // Show preview immediately using Object URL (Performance optimization)
        const objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);

        // Upload to backend
        setIsUploadingImage(true);
        try {
            // 🔍 Debug: Log upload details
            console.log('📤 [UPLOAD] Starting image upload');
            console.log('  - File name:', file.name);
            console.log('  - File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('  - API endpoint:', API_ENDPOINTS.uploadImage);
            console.log('  - Token exists:', !!token);
            console.log('  - Token preview:', token ? `${token.substring(0, 20)}...` : 'null');

            const formData = new FormData();
            formData.append('image', file);

            const headers: HeadersInit = {
                'Authorization': `Bearer ${token}` // Token already validated above
            };

            console.log('📤 [UPLOAD] Sending request...');

            const response = await fetch(API_ENDPOINTS.uploadImage, {
                method: 'POST',
                headers,
                body: formData,
            });

            console.log('📥 [UPLOAD] Response status:', response.status);
            console.log('📥 [UPLOAD] Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [UPLOAD] Error response:', errorData);
                console.error('❌ [UPLOAD] Status code:', response.status);
                
                // 🔒 If token error, suggest re-login
                if (response.status === 401 || response.status === 403) {
                    toast.error('登录已过期，请重新登录');
                    setTimeout(() => {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_data');
                        window.location.href = '/auth';
                    }, 1500);
                    return;
                }
                
                throw new Error(errorData.message || 'Image upload failed');
            }

            const data = await response.json();
            setUploadedImageId(data.imageId || data.id || data.url);

            // If backend returns a processed URL, we could switch to it, 
            // but keeping the local blob is faster for now. 
            // Only switch if necessary (e.g. if backend did some processing)
            if (data.url) {
                // Optional: setImage(data.url);
            }

            toast.success('图片上传成功');
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : '图片上传失败，请稍后再试';
            toast.error(errorMessage);
            // Reset image on failure
            setImage(null);
        } finally {
            setIsUploadingImage(false);
        }
    };

    return {
        image,
        setImage,
        uploadedImageId,
        isUploadingImage,
        handleImageUpload,
    };
}
