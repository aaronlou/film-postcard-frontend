/**
 * 图片 URL 工具函数
 * 用于从后端返回的图片 URL 中提取不同版本
 */

export interface ImageVersions {
  original: string;
  medium?: string;
  thumb?: string;
}

/**
 * 从后端 imageUrl 提取多版本图片
 * 
 * 后端命名规范：
 * - 原图: /uploads/user/photo123.jpg
 * - 中图: /uploads/user/photo123_medium.jpg
 * - 缩略图: /uploads/user/photo123_thumb.jpg
 */
export function parseImageVersions(imageUrl: string): ImageVersions {
  if (!imageUrl) {
    return { original: '' };
  }

  // 提取文件路径和扩展名
  const lastDotIndex = imageUrl.lastIndexOf('.');
  const lastSlashIndex = imageUrl.lastIndexOf('/');
  
  if (lastDotIndex === -1 || lastSlashIndex === -1) {
    return { original: imageUrl };
  }

  const basePath = imageUrl.substring(0, lastDotIndex);
  const extension = imageUrl.substring(lastDotIndex);

  return {
    original: imageUrl,
    medium: `${basePath}_medium${extension}`,
    thumb: `${basePath}_thumb${extension}`,
  };
}

/**
 * 获取最佳显示图片 URL
 * @param imageUrl 原图 URL
 * @param preferredSize 'thumb' | 'medium' | 'original'
 */
export function getBestImageUrl(imageUrl: string, preferredSize: 'thumb' | 'medium' | 'original' = 'medium'): string {
  const versions = parseImageVersions(imageUrl);
  
  switch (preferredSize) {
    case 'thumb':
      return versions.thumb || versions.medium || versions.original;
    case 'medium':
      return versions.medium || versions.original;
    case 'original':
    default:
      return versions.original;
  }
}
