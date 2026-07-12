import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">Create an account</h3>
        <p className="text-sm text-gray-500 mt-1">Register to start ordering food</p>
      </div>
      
      <RegisterForm />
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Already have an account? </span>
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </div>
    </div>
  );
};
