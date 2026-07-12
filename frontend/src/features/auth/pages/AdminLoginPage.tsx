import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-primary-700" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Staff & Admin Portal</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Secure login for authorized canteen personnel only.
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-2xl"></div>
        <LoginForm 
          emailLabel="Admin / Staff Email" 
          emailPlaceholder="admin@sltc.ac.lk or personal email" 
        />
      </div>
      
      <div className="mt-8 text-center text-xs">
        <span className="text-gray-400">Not staff? </span>
        <Link to="/login" className="font-semibold text-gray-500 hover:text-gray-800 underline">
          Return to Student Login
        </Link>
      </div>
    </div>
  );
};
