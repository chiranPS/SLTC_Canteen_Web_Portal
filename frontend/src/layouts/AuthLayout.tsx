import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // If already logged in, redirect away from auth pages
  if (isAuthenticated && user) {
    if (user.role === 'STUDENT') return <Navigate to="/menu" replace />;
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <img
          src="/login-bg.png"
          alt="Canteen Environment"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transform hover:scale-105 transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-900/60 to-primary-900/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />

        {/* SLTC Campus Logo Overlay */}
        <div className="absolute top-0 left-0 p-10 z-10">
          <div className="h-16 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl">
            <img src="/logo.png" alt="SLTC Logo" className="h-full object-contain" />
          </div>
        </div>

        {/* Left side content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 text-white">
          <div className="w-16 h-1 bg-primary-500 mb-6 rounded-full" />
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
            Fuel Your Success.
          </h1>
          <p className="text-lg text-gray-300 max-w-lg leading-relaxed font-medium">
            Order delicious, fresh meals instantly from the SLTC main canteen. Skip the lines and focus on what truly matters.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        {/* Mobile decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-100 blur-3xl opacity-50 z-0 lg:hidden" />

        <div className="mx-auto w-full max-w-sm relative z-10 flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <div className="h-16 flex items-center justify-center mb-6">
              <img src="/logo.png" alt="SLTC Logo" className="h-full object-contain" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-900 drop-shadow-sm">
              Click<span className="text-secondary-500">2</span>Eat
            </h2>
            <p className="font-bold text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 ml-1">
              by <span className="text-gray-800">SLTC</span>
            </p>
          </div>

          <div className="bg-white py-8 px-4 sm:rounded-3xl sm:px-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center relative z-10">
          <p className="text-sm font-medium text-gray-400 flex flex-col items-center sm:block">
            <span>All Rights Reserved 2026 SLTC</span>
            <span className="text-primary-500 sm:inline sm:ml-1">Solution by{' '}
              <a
                href="https://www.linkedin.com/in/chiran-samarasekara-7a767a29b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-2 font-semibold"
              >
                Chiran Samarasekara
              </a>
            </span>
          </p>
        </div>
      </div>
    </div>

  );
};
