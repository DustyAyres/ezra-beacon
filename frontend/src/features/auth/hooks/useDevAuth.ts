import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

export const useDevAuth = () => {
  const { instance } = useMsal();
  const isDevelopment = process.env.REACT_APP_BYPASS_AUTH === 'true';
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(
    isDevelopment && sessionStorage.getItem('devAuthEnabled') === 'true'
  );

  // Restore dev auth on mount if it was previously enabled
  useEffect(() => {
    if (isDevelopment && sessionStorage.getItem('devAuthEnabled') === 'true' && !instance.getActiveAccount()) {
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
      instance.setActiveAccount(mockAccount as any);
    }
  }, [isDevelopment, instance]);

  const loginWithDevAuth = () => {
    console.log('loginWithDevAuth called, isDevelopment:', isDevelopment);
    if (!isDevelopment) {
      console.error('Dev auth attempted but REACT_APP_BYPASS_AUTH is not true');
      return;
    }
    
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
    console.log('Mock account set:', instance.getActiveAccount());
    
    // Store in session storage to persist across reloads
    sessionStorage.setItem('devAuthEnabled', 'true');
    console.log('Session storage set, devAuthEnabled:', sessionStorage.getItem('devAuthEnabled'));
    setIsDevAuthenticated(true);
  };

  const logoutDevAuth = () => {
    sessionStorage.removeItem('devAuthEnabled');
    instance.setActiveAccount(null);
    setIsDevAuthenticated(false);
  };

  return { isDevelopment, isDevAuthenticated, loginWithDevAuth, logoutDevAuth };
};
