import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WebsiteContext = createContext();

export function WebsiteProvider({ children }) {
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeWebsite();
  }, []);

  const initializeWebsite = async () => {
    try {
      const { data: websitesData, error } = await supabase
        .from('websites')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      setWebsites(websitesData || []);

      // Hardcoding to website ID 3
      const websiteIdToSet = 'df707bc1-f8fd-44fc-856b-fa6bb12f41a7';
      let selectedWebsite = websitesData?.find(w => w.id === websiteIdToSet);

      // Fallback to the first website if website with ID 3 is not found
      if (!selectedWebsite && websitesData?.length > 0) {
        console.warn(`Website with ID ${websiteIdToSet} not found. Falling back to the first available website.`);
        selectedWebsite = websitesData[0];
      }

      setCurrentWebsite(selectedWebsite);
    } catch (error) {
      console.error('Error initializing website:', error);
      setCurrentWebsite({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Main Store',
        domain: 'mainstore.com',
        is_active: true,
        config: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const switchWebsite = (websiteId) => {
    const website = websites.find(w => w.id === websiteId);
    if (website) {
      setCurrentWebsite(website);
      localStorage.setItem('selected_website_id', websiteId);
    }
  };

  const value = {
    currentWebsite,
    websites,
    loading,
    switchWebsite,
    websiteId: currentWebsite?.id || '00000000-0000-0000-0000-000000000001'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within WebsiteProvider');
  }
  return context;
}
