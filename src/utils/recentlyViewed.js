const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

export const addToRecentlyViewed = (product) => {
  if (!product || !product.id) return;

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let items = stored ? JSON.parse(stored) : [];

    // Remove if already exists to move it to the front
    items = items.filter(item => item.id !== product.id);

    // Add to the beginning
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category_name: product.categories?.name || 'Workspace'
    };

    items.unshift(newItem);

    // Keep only the last MAX_ITEMS
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error updating recently viewed:', error);
  }
};

export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    return [];
  }
};
