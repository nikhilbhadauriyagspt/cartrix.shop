/**
 * Normalizes image URLs to ensure they are absolute from the root
 * if they are relative paths.
 */
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};
