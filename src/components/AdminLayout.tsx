import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquare, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/pengurus/login');
  };

  // Simple auth check - don't render layout if on login page
  if (location.pathname === '/pengurus/login') {
    return <Outlet />;
  }

  // Redirect if not logged in
  if (localStorage.getItem('adminAuth') !== 'true') {
    // In a real app we'd use a more robust auth check. For this demo, just redirect in a timeout to avoid render cycle issues
    setTimeout(() => navigate('/pengurus/login'), 0);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788310116346-file_000000007ed881faae311454aeec136b.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
            <img src="https://raw.githubusercontent.com/dapidd12/storage/main/tes/1788310116346-file_000000007ed881faae311454aeec136b.png" alt="Logo OSIS SMAN 1 Kemangkon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Admin Panel</h2>
            <p className="text-xs text-slate-400">Kotak Curhat OSIS</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-0">
          <Link
            to="/pengurus/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              location.pathname.includes('/pengurus/dashboard') 
                ? "bg-sky-600 text-white shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Ke Papan Publik</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 w-full min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
