import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error('Login failed:', error);
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/assets/images/ezra-logo.png" alt="Ezra Logo" className="login-logo" />
        <h1 className="login-title">Welcome to Ezra Beacon</h1>
        <p className="login-subtitle">Your personal task management companion</p>
        <button className="login-button" onClick={handleLogin}>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
