// Logo configuration for USDStack
import logoImage from './usdstack-logo.png';

// Get the base path from Vite config
const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : base + '/';
};

// Get the correct logo path for production
const getLogoPath = () => {
  // In development, use the imported logo
  if (import.meta.env.DEV) {
    return logoImage;
  }

  // In production, try the imported logo first, then fallback
  return logoImage;
};

export const LOGO_CONFIG = {
  // Main logo image (handles both dev and production)
  image: getLogoPath(),

  // Alternative fallback (handles base path for production)
  fallback: `${getBasePath()}usdstack-logo.png`,
  
  // Logo dimensions for different use cases
  sizes: {
    navbar: {
      width: 40,
      height: 40,
    },
    sidebar: {
      width: 40,
      height: 40,
    },
    large: {
      width: 80,
      height: 80,
    },
    favicon: {
      width: 32,
      height: 32,
    }
  },
  
  // Alt text
  alt: 'Python Air Drop logo',
  
  // Common styles
  styles: {
    borderRadius: '8px',
    objectFit: 'contain' as const,
  }
};

export default LOGO_CONFIG;
