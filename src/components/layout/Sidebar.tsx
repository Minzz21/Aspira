"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTableCellsLarge, 
  faBuildingColumns, 
  faShieldHalved, 
  faUsersGear, 
  faGear, 
  faRightFromBracket,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const menuItems = [
  { label: 'Dashboard Desa', icon: faTableCellsLarge, route: '/dashboard' },
  { label: 'Profil Desa & UMKM', icon: faBuildingColumns, route: '/profil-desa' },
  { label: 'Aspirasi Warga', icon: faCommentDots, route: '/aspirasi-warga' },
  { label: 'Whitelist Warga', icon: faShieldHalved, route: '/whitelist-warga' },
  { label: 'Akun Warga', icon: faUsersGear, route: '/akun-warga' },
  { label: 'Pengaturan', icon: faGear, route: '/pengaturan' },
];

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebar();
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    showToast('Anda telah keluar.', 'info');
    router.push('/');
  };

  return (
    <div 
      className={`relative h-screen bg-primary text-white flex flex-col transition-all duration-300 z-40 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggle}
        className="absolute -right-3 top-7 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-primary-dark shadow-md hover:bg-green-300 hover:scale-110 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} className="text-[10px]" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 h-20 px-6 shrink-0 border-b border-white/10 overflow-hidden whitespace-nowrap">
        <img src="/logo.png" alt="ASPIRA AI" className="w-8 h-8 rounded-lg shrink-0 object-cover" />
        <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="font-extrabold text-lg tracking-tight">ASPIRA AI</h2>
          <p className="text-[9px] font-mono text-green-300 uppercase tracking-widest mt-0.5">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <Link 
              key={item.route}
              href={item.route}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-green-100/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="w-6 flex justify-center shrink-0">
                <FontAwesomeIcon icon={item.icon} className={`text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              </div>
              <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                {item.label}
              </span>
              
              {/* Custom Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100 h-10 mb-4'}`}>
          {admin?.avatar ? (
            <img src={admin.avatar} alt={admin.nama} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white/20" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 border-2 border-white/20 font-bold text-white shadow-inner">
              {admin?.nama?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{admin?.nama || 'Admin'}</p>
            <p className="text-xs text-green-300 truncate">{admin?.role || 'Administrator'}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-danger hover:bg-danger/10 hover:text-red-400 transition-colors group relative"
        >
          <div className="w-6 flex justify-center shrink-0">
            <FontAwesomeIcon icon={faRightFromBracket} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className={`text-sm font-bold whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto inline-block'}`}>
            Keluar Sistem
          </span>

          {/* Custom Tooltip when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-danger text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
              Keluar Sistem
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
