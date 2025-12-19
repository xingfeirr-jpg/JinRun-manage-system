
import React from 'react';
import { User, UserRole, AppTab } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AutoFix Pro
            </h1>
            <div className="hidden md:flex gap-4">
              <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="工作台" />
              <NavItem active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} label="客户管理" />
              <NavItem active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} label="车辆档案" />
              <NavItem active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="财务中心" />
              {user.role === UserRole.ADMIN && (
                <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="系统设置" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role === UserRole.ADMIN ? '系统管理员' : '职员'}</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem: React.FC<{active: boolean, onClick: () => void, label: string}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

export default Navbar;
