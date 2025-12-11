
import React from 'react';
import { Save, Bell, Lock, Globe, Info, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">系统设置</h2>
      
      <div className="max-w-3xl space-y-6">
        
        {/* General */}
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

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-slate-400" /> 安全与权限
          </h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">数据自动备份</div>
                  <div className="text-xs text-slate-500">每日凌晨 2:00 备份数据到云端</div>
                </div>
                 <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4"/>
                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-green-500 cursor-pointer"></label>
                </div>
             </div>
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

        <div className="flex justify-end pt-4 pb-12">
           <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-colors">
             <Save size={18} /> 保存配置
           </button>
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
