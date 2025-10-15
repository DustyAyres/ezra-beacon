import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

export const useDevAuth = () => {
  const { instance } = useMsal();
  const isDevelopment = process.env.REACT_APP_BYPASS_AUTH === 'true';
  const [isDevAuthReady, setIsDevAuthReady] = useState(false);

  useEffect(() => {
    if (isDevelopment) {
      // Mock authentication for development
      console.warn('⚠️ DEVELOPMENT MODE: Authentication is bypassed');
      
      // Create a mock account
      const mockAccount = {
        homeAccountId: 'dev-user-123',
        environment: 'development',
        tenantId: 'dev-tenant',
        username: 'dev@localhost',
        localAccountId: 'dev-user-123',
        name: 'Development User',
        idTokenClaims: {
          oid: 'dev-user-123',
          name: 'Development User',
          email: 'dev@localhost'
        }
      };

      // Set the active account
      instance.setActiveAccount(mockAccount as any);
      
      // Store in session storage to persist across reloads
      sessionStorage.setItem('devAuthEnabled', 'true');
      setIsDevAuthReady(true);
    } else {
      setIsDevAuthReady(true);
    }
  }, [isDevelopment, instance]);

  return { isDevelopment, isDevAuthReady };
};
