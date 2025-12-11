
import React from 'react';
import { LayoutGrid, Users, PieChart, Settings, LogOut, Network } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  return (
    <div className="w-16 md:w-64 bg-slate-900 text-slate-300 flex flex-col h-screen flex-shrink-0 transition-all duration-300">
      <div className="p-4 flex items-center gap-3 border-b border-slate-800 h-16">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
          TF
        </div>
        <span className="font-semibold text-white tracking-tight hidden md:block">TalentFlow</span>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        <NavItem 
          icon={<LayoutGrid size={20} />} 
          label="人才九宫格" 
          active={currentView === 'grid'} 
          onClick={() => onNavigate('grid')}
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="员工列表" 
          active={currentView === 'list'}
          onClick={() => onNavigate('list')}
        />
        <NavItem 
          icon={<Network size={20} />} 
          label="继任者地图" 
          active={currentView === 'succession'}
          onClick={() => onNavigate('succession')}
        />
        <NavItem 
          icon={<PieChart size={20} />} 
          label="数据分析" 
          active={currentView === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavItem 
          icon={<Settings size={20} />} 
          label="系统设置" 
          active={currentView === 'settings'}
          onClick={() => onNavigate('settings')} 
        />
        <NavItem 
          icon={<LogOut size={20} />} 
          label="退出登录" 
          onClick={onLogout} 
        />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${active ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="hidden md:block text-sm font-medium">{label}</span>
  </button>
);
