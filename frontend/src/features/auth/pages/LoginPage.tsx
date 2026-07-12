import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">Sign in to your account</h3>
        <p className="text-sm text-gray-500 mt-1">Use your SLTC university email to continue</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Don't have an account? </span>
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};
