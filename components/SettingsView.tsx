
import React, { useState } from 'react';
import { Save, Bell, Lock, Globe, Info, CheckCircle2, Users, KeyRound, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { User, TenantAuth } from '../types';

interface SettingsViewProps {
  currentUser?: User;
  departments?: string[];
  tenantAuth?: TenantAuth;
  onUpdatePassword?: (dept: string, pass: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentUser, 
  departments = [], 
  tenantAuth, 
  onUpdatePassword 
}) => {
  const isHR = currentUser?.role === 'HR_BP';
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleSavePassword = (dept: string) => {
    if (onUpdatePassword && newPassword) {
      onUpdatePassword(dept, newPassword);
    }
    setEditingDept(null);
    setNewPassword('');
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">系统配置与管理</h2>
      
      <div className="max-w-4xl space-y-8">

        {/* --- USER MANAGEMENT SECTION (HR ONLY) --- */}
        {isHR && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <Users size={20} className="text-blue-600" /> 用户与权限管理
               </h3>
               <p className="text-sm text-slate-500 mt-1">
                 管理各部门业务负责人的访问权限。您可以为新部门分配初始密码，或重置遗忘的密码。
               </p>
            </div>
            
            <div className="p-0">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                   <tr>
                     <th className="px-6 py-4">部门名称 (账号)</th>
                     <th className="px-6 py-4">账号类型</th>
                     <th className="px-6 py-4">当前状态</th>
                     <th className="px-6 py-4 w-64">访问密码管理</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {departments.map(dept => {
                     const hasPassword = tenantAuth?.managerPasswords?.[dept];
                     const isEditing = editingDept === dept;

                     return (
                       <tr key={dept} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-800">{dept}</td>
                         <td className="px-6 py-4 text-slate-500">业务负责人 (Manager)</td>
                         <td className="px-6 py-4">
                           {hasPassword ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                               <CheckCircle2 size={12} /> 已激活
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                               未设置密码
                             </span>
                           )}
                         </td>
                         <td className="px-6 py-4">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="输入新密码"
                                  className="w-32 px-2 py-1.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleSavePassword(dept)}
                                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="确认"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                                <button 
                                  onClick={() => setEditingDept(null)}
                                  className="p-1.5 bg-white border border-slate-300 text-slate-500 rounded hover:bg-slate-50"
                                  title="取消"
                                >
                                  <Users size={14} className="rotate-45" /> {/* Using Users as close icon substitute visually or X */}
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingDept(dept);
                                  setNewPassword('');
                                }}
                                className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <KeyRound size={14} />
                                {hasPassword ? '重置密码' : '分配密码'}
                              </button>
                            )}
                         </td>
                       </tr>
                     );
                   })}
                   {departments.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                         暂无部门数据。请先在员工名册中导入数据。
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
            <div className="bg-blue-50 px-6 py-3 border-t border-blue-100 flex items-center gap-2 text-xs text-blue-700">
              <Info size={14} />
              <span>提示: 请通过安全的线下渠道（如加密邮件或内部IM）将密码分发给各部门负责人。</span>
            </div>
          </div>
        )}
        
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-slate-400" /> 通用设置
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">系统语言</div>
                  <div className="text-xs text-slate-500">选择界面的默认语言</div>
                </div>
                <select className="border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50">
                   <option>简体中文</option>
                   <option>English</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">主题模式</div>
                  <div className="text-xs text-slate-500">切换日间/夜间模式</div>
                </div>
                <select className="border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50">
                   <option>浅色 (Light)</option>
                   <option>深色 (Dark)</option>
                </select>
             </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-slate-400" /> 通知偏好
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm text-slate-700">启用人才盘点结果自动邮件通知</span>
            </label>
             <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300" />
              <span className="text-sm text-slate-700">当 Gemini AI 完成分析时提醒我</span>
            </label>
          </div>
        </div>

        {/* About Product */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Info size={20} className="text-blue-500" /> 关于 TalentFlow AI
          </h3>
          <p className="text-sm text-blue-800 mb-4 font-medium">
            2025年度企业级智能人才盘点解决方案
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureItem text="交互式九宫格校准 (Drag & Drop)" />
            <FeatureItem text="Gemini AI 驱动的继任计划" />
            <FeatureItem text="团队健康度与风险诊断" />
            <FeatureItem text="一键生成汇报快照与报表" />
          </div>
          <div className="mt-6 pt-4 border-t border-blue-200 flex justify-between items-center text-xs text-blue-600">
            <span>Version 2.5.0 (Pro)</span>
            <span>© 2025 TalentFlow Inc.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm text-slate-700">
    <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);
