import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../features/cart/context/CartContext';
import { LogOut, User as UserIcon, ShoppingBag, ClipboardList, LayoutDashboard, UtensilsCrossed, Settings, ScanLine, Menu, X, Database, Layers, Users } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const NavLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
    const isActive = location.pathname.startsWith(to) && (to !== '/admin' || location.pathname === '/admin');

    return (
      <button
        onClick={() => {
          navigate(to);
          if (onClick) onClick();
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0",
          isActive
            ? "bg-primary-50 text-primary-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon size={20} className={isActive ? "text-primary-600" : "text-gray-400"} />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Premium Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            {/* Logo + Nav Links */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                <div className="h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <img src="/logo.png" alt="SLTC Logo" className="h-full object-contain" />
                </div>
                <div>
                  <span className="font-black text-2xl tracking-tighter leading-none block bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900 drop-shadow-sm">
                    Click<span className="text-secondary-500">2</span>Eat
                  </span>
                  <span className="font-bold text-[10px] text-gray-500 uppercase tracking-[0.2em] block mt-1 ml-0.5">
                    by <span className="text-gray-800">SLTC</span>
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 ml-2 overflow-x-auto scrollbar-none">
                {!isAdmin ? (
                  <>
                    <NavLink to="/menu" icon={UtensilsCrossed} label="Menu" />
                    <NavLink to="/history" icon={ClipboardList} label="My Orders" />
                  </>
                ) : (
                  <>
                    <NavLink to="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <NavLink to="/admin/orders" icon={ClipboardList} label="Kitchen Ops" />
                    <NavLink to="/admin/orders/all" icon={Database} label="All Orders" />
                    <NavLink to="/admin/scan-qr" icon={ScanLine} label="Scan QR" />
                    <NavLink to="/admin/meals" icon={UtensilsCrossed} label="Meals CMS" />
                    <NavLink to="/admin/categories" icon={Layers} label="Categories CMS" />
                    <NavLink to="/admin/users" icon={Users} label="Admins CMS" />
                    <NavLink to="/admin/settings" icon={Settings} label="System Config" />
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions — flex-shrink-0 ensures they're always visible */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">

              {/* Cart Button (Students Only) */}
              {!isAdmin && (
                <button
                  onClick={toggleSidebar}
                  className="relative p-2.5 text-gray-600 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-all duration-200"
                >
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform scale-110">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              <div className="h-8 w-px bg-gray-200 hidden sm:block mx-2"></div>

              {/* User Profile */}
              <Link to="/profile" className="flex items-center gap-3 bg-gray-50/80 hover:bg-gray-100 transition-colors px-4 py-2 rounded-2xl border border-gray-100 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                  <UserIcon size={16} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{user?.role}</p>
                </div>
              </Link>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                title="Logout"
              >
                <LogOut size={20} />
              </Button>
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-all"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl absolute top-full left-0 right-0 shadow-lg animate-in slide-in-from-top-2">
            <div className="px-4 py-6 space-y-2">
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 bg-gray-50/80 hover:bg-gray-100 transition-colors px-4 py-3 rounded-2xl border border-gray-100 mb-6 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{user?.role}</p>
                </div>
              </Link>

              {!isAdmin ? (
                <>
                  <NavLink to="/menu" icon={UtensilsCrossed} label="Menu" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/history" icon={ClipboardList} label="My Orders" onClick={() => setIsMobileMenuOpen(false)} />
                </>
              ) : (
                <>
                  <NavLink to="/admin" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/orders" icon={ClipboardList} label="Kitchen Ops" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/orders/all" icon={Database} label="All Orders" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/scan-qr" icon={ScanLine} label="Scan QR" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/meals" icon={UtensilsCrossed} label="Meals CMS" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/categories" icon={Layers} label="Categories CMS" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/users" icon={Users} label="Admins CMS" onClick={() => setIsMobileMenuOpen(false)} />
                  <NavLink to="/admin/settings" icon={Settings} label="System Config" onClick={() => setIsMobileMenuOpen(false)} />
                </>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto text-center border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-400">
          All Rights Reserved 2026 SLTC
          <br />
          <span className="text-primary-500"> Solution by{' '}
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
      </footer>
    </div>
  );
};
