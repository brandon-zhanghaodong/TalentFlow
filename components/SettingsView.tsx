
import React, { useState, useMemo, useRef } from 'react';
import { Save, Bell, Lock, Globe, Info, CheckCircle2, Users, KeyRound, Eye, EyeOff, RefreshCw, Trash2, Plus, X, AlertTriangle, Upload, FileUp, Sparkles, Loader2 } from 'lucide-react';
import { User, TenantAuth } from '../types';
import { parseOrgStructure } from '../services/geminiService';

interface SettingsViewProps {
  currentUser?: User;
  departments?: string[];
  tenantAuth?: TenantAuth;
  onUpdatePassword?: (dept: string, pass: string) => void;
  onAddManager?: (dept: string, pass: string) => void;
  onRemoveManager?: (dept: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentUser, 
  departments = [], 
  tenantAuth, 
  onUpdatePassword,
  onAddManager,
  onRemoveManager
}) => {
  const isHR = currentUser?.role === 'HR_BP';
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptPass, setNewDeptPass] = useState('');

  // Delete User State
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Batch Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Merge lists: Departments from AuthStore (Active Accounts) + Departments from Employee Data (Potential Accounts)
  const allDepartments = useMemo(() => {
    const configured = Object.keys(tenantAuth?.managerPasswords || {});
    const fromData = departments || [];
    return Array.from(new Set([...configured, ...fromData])).sort();
  }, [departments, tenantAuth]);

  const handleSavePassword = (dept: string) => {
    if (onUpdatePassword && newPassword) {
      onUpdatePassword(dept, newPassword);
    }
    setEditingDept(null);
    setNewPassword('');
  };

  const handleCreateUser = () => {
    if (newDeptName && newDeptPass && onAddManager) {
      onAddManager(newDeptName, newDeptPass);
      setShowAddModal(false);
      setNewDeptName('');
      setNewDeptPass('');
    }
  };

  const handleDeleteUser = (dept: string) => {
    if (onRemoveManager) {
      onRemoveManager(dept);
    }
    setDeleteConfirm(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type for Gemini API support
    // Gemini supports: PNG, JPEG, WEBP, HEIC, HEIF, PDF
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert("格式不支持。AI 解析仅支持 PNG, JPG, WEBP, HEIC 图片或 PDF 文档。");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    setIsProcessingFile(true);
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Content = base64String.split(',')[1];
        const mimeType = file.type;

        try {
            const departments = await parseOrgStructure(base64Content, mimeType);
            
            if (departments && departments.length > 0) {
                let count = 0;
                departments.forEach(d => {
                    // Only add if not exists (rudimentary check, mostly handled by auth store overwrites)
                    if (d.department) {
                        onAddManager?.(d.department, "123456"); // Default password
                        count++;
                    }
                });
                alert(`AI 成功识别并添加了 ${count} 个部门账号！\n默认密码已设置为: 123456`);
            } else {
                alert("AI 未能从文件中识别出有效的部门信息，请尝试更清晰的图片或文档。");
            }
        } catch (err) {
            console.error(err);
            alert("文件解析失败，请重试。");
        } finally {
            setIsProcessingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <div className="flex items-center justify-between mb-6 max-w-4xl">
         <h2 className="text-2xl font-bold text-slate-900">系统配置与管理</h2>
      </div>
      
      <div className="max-w-4xl space-y-8">

        {/* --- USER MANAGEMENT SECTION (HR ONLY) --- */}
        {isHR && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={20} className="text-blue-600" /> 用户与权限管理
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    管理各部门业务负责人的访问账号。
                  </p>
               </div>
               
               <div className="flex gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png,image/jpeg,image/webp,image/heic,application/pdf"
                    onChange={handleFileUpload}
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isProcessingFile}
                   className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                 >
                   {isProcessingFile ? <Loader2 size={16} className="animate-spin text-purple-600"/> : <Sparkles size={16} className="text-purple-600"/>}
                   <span>{isProcessingFile ? 'AI 解析中...' : 'AI 智能导入'}</span>
                 </button>
                 
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                 >
                   <Plus size={16} />
                   新增
                 </button>
               </div>
            </div>
            
            <div className="p-0">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                   <tr>
                     <th className="px-6 py-4">部门名称 (账号)</th>
                     <th className="px-6 py-4">权限角色</th>
                     <th className="px-6 py-4">当前状态</th>
                     <th className="px-6 py-4 w-64 text-right">操作</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {allDepartments.map(dept => {
                     const hasPassword = tenantAuth?.managerPasswords?.[dept];
                     const isEditing = editingDept === dept;
                     const isConfirmingDelete = deleteConfirm === dept;

                     return (
                       <tr key={dept} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                             {dept.substring(0, 1)}
                           </div>
                           {dept}
                         </td>
                         <td className="px-6 py-4 text-slate-500">部门负责人 (Manager)</td>
                         <td className="px-6 py-4">
                           {hasPassword ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                               <CheckCircle2 size={12} /> 已激活
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                               未配置账号
                             </span>
                           )}
                         </td>
                         <td className="px-6 py-4 text-right">
                            {isConfirmingDelete ? (
                               <div className="flex items-center justify-end gap-2 animate-in fade-in">
                                  <span className="text-xs text-red-600 font-medium mr-1">确定删除?</span>
                                  <button onClick={() => handleDeleteUser(dept)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><CheckCircle2 size={16}/></button>
                                  <button onClick={() => setDeleteConfirm(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded"><X size={16}/></button>
                               </div>
                            ) : isEditing ? (
                              <div className="flex items-center justify-end gap-2 animate-in fade-in">
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
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingDept(dept);
                                    setNewPassword('');
                                  }}
                                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                  <KeyRound size={14} />
                                  {hasPassword ? '重置密码' : '激活账号'}
                                </button>
                                {hasPassword && (
                                  <button 
                                    onClick={() => setDeleteConfirm(dept)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="删除账号"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            )}
                         </td>
                       </tr>
                     );
                   })}
                   {allDepartments.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                         <div className="flex flex-col items-center gap-2">
                            <Users size={32} className="text-slate-300"/>
                            <p>暂无账号信息。请点击右上角新增账号或使用 AI 导入。</p>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
            <div className="bg-blue-50 px-6 py-3 border-t border-blue-100 flex items-center gap-2 text-xs text-blue-700 justify-between">
              <div className="flex items-center gap-2">
                <Info size={14} />
                <span>提示: 支持上传 组织架构图(图片) 或 PDF 名单。AI 将自动识别部门并创建默认密码 (123456)。</span>
              </div>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">新增管理者账号</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">部门名称</label>
                    <input 
                      type="text" 
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="例如: 财务部"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 mt-1">这将作为用户登录时选择的身份。</p>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">初始访问密码</label>
                    <input 
                      type="text" 
                      value={newDeptPass}
                      onChange={(e) => setNewDeptPass(e.target.value)}
                      placeholder="设置密码"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                 </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                 <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-colors">取消</button>
                 <button 
                   onClick={handleCreateUser}
                   disabled={!newDeptName || !newDeptPass}
                   className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                 >
                   创建账号
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-sm text-slate-700">
    <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);
