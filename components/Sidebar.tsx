
import React from 'react';
import { LayoutGrid, Users, PieChart, Settings, LogOut, Network, MessageSquareText, ClipboardList } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, currentUser }) => {
  return (
    <div className="w-16 md:w-64 bg-slate-900 text-slate-300 flex flex-col h-screen flex-shrink-0 transition-all duration-300 shadow-xl z-20">
      <div className="p-4 flex items-center gap-3 border-b border-slate-800 h-16 cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => onNavigate('home')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-900/50">
          TF
        </div>
        <span className="font-semibold text-white tracking-tight hidden md:block">TalentFlow</span>
      </div>

      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Workflow Order: Prepare -> Calibrate -> Plan -> Review */}
        
        <NavItem 
          icon={<MessageSquareText size={20} />} 
          label="AI 助手主页" 
          active={currentView === 'home'}
          onClick={() => onNavigate('home')}
        />

        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:block mt-4">
          1. 盘点准备
        </div>
        <NavItem 
          icon={<Users size={20} />} 
          label="员工花名册" 
          active={currentView === 'list'}
          onClick={() => onNavigate('list')}
        />

        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:block mt-2">
          2. 校准与评估
        </div>
        <NavItem 
          icon={<LayoutGrid size={20} />} 
          label="人才九宫格" 
          active={currentView === 'grid'} 
          onClick={() => onNavigate('grid')}
        />
        <NavItem 
          icon={<Network size={20} />} 
          label="继任者地图" 
          active={currentView === 'succession'}
          onClick={() => onNavigate('succession')}
        />

        <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:block mt-2">
          3. 规划与复盘
        </div>
        <NavItem 
          icon={<ClipboardList size={20} />} 
          label="行动计划" 
          active={currentView === 'plan'}
          onClick={() => onNavigate('plan')}
        />
        <NavItem 
          icon={<PieChart size={20} />} 
          label="数据分析" 
          active={currentView === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />
      </nav>

      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="p-4">
          <NavItem 
            icon={<Settings size={20} />} 
            label="系统设置" 
            active={currentView === 'settings'}
            onClick={() => onNavigate('settings')} 
          />
        </div>
        
        {/* User Profile Section - Redesigned for better click targets */}
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4 px-2">
              <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-600" />
              <div className="flex-1 min-w-0 hidden md:block">
                 <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                 <div className="text-xs text-slate-500 truncate">
                   {currentUser.role === 'HR_BP' ? 'HR 管理员' : currentUser.department}
                 </div>
              </div>
           </div>
           
           <button 
             onClick={onLogout} 
             className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors group"
             title="退出登录"
           >
             <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
             <span className="hidden md:block text-sm font-medium">退出登录</span>
           </button>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 border-l-4 ${active ? 'bg-slate-800 text-blue-400 border-blue-500' : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="hidden md:block text-sm font-medium">{label}</span>
  </button>
);
