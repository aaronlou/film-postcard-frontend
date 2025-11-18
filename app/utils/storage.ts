/**
 * Storage utility functions
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateStoragePercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 100);
}

export function getTierDisplayName(tier?: string): string {
  switch (tier) {
    case 'FREE':
      return 'Free';
    case 'BASIC':
      return 'Basic';
    case 'PRO':
      return 'Pro';
    default:
      return 'Free';
  }
}

export function getTierColor(tier?: string): string {
  switch (tier) {
    case 'FREE':
      return 'text-stone-400';
    case 'BASIC':
      return 'text-blue-400';
    case 'PRO':
      return 'text-amber-400';
    default:
      return 'text-stone-400';
  }
}

export function getStorageBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-orange-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
}
