import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../../config/authConfig';
import { useDevAuth } from '../hooks/useDevAuth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const { isDevelopment, loginWithDevAuth } = useDevAuth();

  const handleMicrosoftLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error('Login failed:', error);
    });
  };

  const handleDevLogin = () => {
    loginWithDevAuth();
    // Reload to trigger App component re-render
    window.location.reload();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/assets/images/ezra-logo.png" alt="Ezra Logo" className="login-logo" />
        <h1 className="login-title">Welcome to Ezra Beacon</h1>
        <p className="login-subtitle">Your personal task management companion</p>
        
        <button className="login-button" onClick={handleMicrosoftLogin}>
          Sign in with Microsoft
        </button>
        
        {isDevelopment && (
          <>
            <div className="login-divider">
              <span>OR</span>
            </div>
            <button className="login-button dev-login-button" onClick={handleDevLogin}>
              Continue as Developer
            </button>
            <p className="login-dev-warning">⚠️ Development Mode - For testing only</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
