
import React, { useState } from 'react';
import { User, AuthStore } from '../types';
import { Lock, ArrowRight, ShieldCheck, Briefcase, Users, Layout, ChevronRight, Building2, KeyRound, Building, ArrowLeft, CheckCircle2, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User, tenantId: string) => void;
  onRegister: (tenantId: string, tenantName: string, adminName: string, adminPass: string) => void;
  existingTenants: Record<string, string>; // ID -> Name map for validation
  authStore: AuthStore;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister, existingTenants, authStore }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [step, setStep] = useState<'org' | 'role'>('org');
  const [tenantIdInput, setTenantIdInput] = useState('');
  const [tenantError, setTenantError] = useState('');
  const [verifiedTenant, setVerifiedTenant] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  
  // Auth State
  const [adminPassword, setAdminPassword] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showAdminLoginInput, setShowAdminLoginInput] = useState(false);

  // Register State
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgId, setRegOrgId] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regAdminPass, setRegAdminPass] = useState('');
  const [regError, setRegError] = useState('');

  // --- LOGIN LOGIC ---
  const handleOrgSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = tenantIdInput.trim().toLowerCase();
    
    if (existingTenants[id]) {
      setVerifiedTenant(id);
      setStep('role');
      setTenantError('');
      // Reset inputs
      setSelectedDept('');
      setManagerPassword('');
      setAdminPassword('');
      setShowAdminLoginInput(false);
      setPasswordError('');
    } else {
      setTenantError('无效的企业代码。请检查输入或注册新账号。');
    }
  };

  const handleHRLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedTenant) return;

    const storedAuth = authStore[verifiedTenant];
    if (!storedAuth || storedAuth.adminPassword !== adminPassword) {
        setPasswordError('管理员密码错误');
        return;
    }

    const hrUser: User = {
      id: 'hr-admin-session',
      name: 'HR Administrator',
      role: 'HR_BP',
      avatar: 'https://ui-avatars.com/api/?name=HR+Admin&background=0D8ABC&color=fff&bold=true'
    };
    onLogin(hrUser, verifiedTenant);
  };

  const handleManagerLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!verifiedTenant) return;
    if (!selectedDept) {
        setPasswordError('请先选择部门');
        return;
    }
    
    const storedAuth = authStore[verifiedTenant];
    const correctPassword = storedAuth?.managerPasswords?.[selectedDept];

    if (!correctPassword) {
        setPasswordError('该部门尚未配置访问权限，请联系HR管理员。');
        return;
    }

    if (managerPassword !== correctPassword) {
        setPasswordError('访问密码错误。请联系HR管理员获取或重置密码。');
        return;
    }

    const managerUser: User = {
      id: `mgr-${Date.now()}`,
      name: `${selectedDept} 负责人`,
      role: 'MANAGER',
      department: selectedDept,
      avatar: `https://ui-avatars.com/api/?name=${selectedDept.substring(0,2)}+Mgr&background=random&color=fff`
    };
    onLogin(managerUser, verifiedTenant);
  };

  // --- REGISTER LOGIC ---
  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = regOrgId.trim().toLowerCase();
    const name = regOrgName.trim();
    const admin = regAdminName.trim();
    const pass = regAdminPass.trim();

    if (!id || !name || !admin || !pass) {
        setRegError("请填写所有必填字段");
        return;
    }
    if (!/^[a-z0-9_]+$/.test(id)) {
        setRegError("企业代码只能包含小写字母、数字和下划线");
        return;
    }
    if (existingTenants[id]) {
        setRegError("该企业代码已被占用，请尝试其他代码");
        return;
    }

    // Success
    onRegister(id, name, admin, pass);
  };

  const autoFillOrgId = (name: string) => {
      setRegOrgName(name);
      if (!regOrgId) {
          const suggested = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          setRegOrgId(suggested.substring(0, 20));
      }
  }

  // Get configured departments for this tenant
  const availableDepts = verifiedTenant && authStore[verifiedTenant]?.managerPasswords 
      ? Object.keys(authStore[verifiedTenant].managerPasswords).sort()
      : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">TF</div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">TalentFlow AI</span>
         </div>
         <div className="text-sm text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
            <Lock size={14} /> 安全工作区
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-5xl flex justify-center">
          
          {mode === 'register' ? (
              /* REGISTRATION FORM */
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-300">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                       <Sparkles size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">注册新企业</h2>
                 </div>

                 <form onSubmit={handleRegSubmit} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">企业名称</label>
                       <input 
                         type="text" 
                         value={regOrgName}
                         onChange={(e) => autoFillOrgId(e.target.value)}
                         placeholder="例如: 创新科技有限公司"
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                         autoFocus
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                           企业代码 (Organization ID)
                       </label>
                       <input 
                         type="text" 
                         value={regOrgId}
                         onChange={(e) => {
                             setRegOrgId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                             setRegError('');
                         }}
                         placeholder="例如: innovation_tech"
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">管理员姓名</label>
                           <input 
                             type="text" 
                             value={regAdminName}
                             onChange={(e) => setRegAdminName(e.target.value)}
                             placeholder="例如: 张三"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                         <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">管理员密码</label>
                           <input 
                             type="password" 
                             value={regAdminPass}
                             onChange={(e) => setRegAdminPass(e.target.value)}
                             placeholder="设置登录密码"
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                    </div>

                    {regError && (
                        <p className="text-red-500 text-sm flex items-center gap-1 bg-red-50 p-2 rounded-lg">
                           <CheckCircle2 size={14} className="rotate-45" /> {regError}
                        </p>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                    >
                      <UserPlus size={18} />
                      立即创建并登录
                    </button>
                 </form>

                 <div className="mt-6 text-center">
                    <button onClick={() => setMode('login')} className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        已有账号？返回登录
                    </button>
                 </div>
              </div>
          ) : step === 'org' ? (
             /* STEP 1: ORGANIZATION LOGIN */
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                      <Building size={32} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900">登录您的工作区</h2>
                   <p className="text-slate-500 mt-2">请输入您的企业代号 (Organization ID)</p>
                </div>

                <form onSubmit={handleOrgSubmit} className="space-y-6">
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">企业代号</label>
                      <input 
                        type="text" 
                        value={tenantIdInput}
                        onChange={(e) => setTenantIdInput(e.target.value)}
                        placeholder="例如: tech_corp"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${tenantError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500 focus:bg-white'}`}
                        autoFocus
                      />
                      {tenantError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <CheckCircle2 size={14} className="rotate-45" /> {tenantError}
                        </p>
                      )}
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
                   >
                     下一步
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                   <div className="flex gap-2 justify-center mb-4">
                      <button onClick={() => setTenantIdInput('tech_corp')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-mono">tech_corp</button>
                      <button onClick={() => setTenantIdInput('retail_grp')} className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-600 font-mono">retail_grp</button>
                   </div>
                   
                   <p className="text-sm text-slate-500">
                       还没有企业账号？ 
                       <button onClick={() => setMode('register')} className="text-blue-600 font-bold hover:underline ml-1">
                           免费注册
                       </button>
                   </p>
                </div>
             </div>
          ) : (
            /* STEP 2: ROLE SELECTION */
            <div className="w-full animate-in fade-in slide-in-from-right-8 duration-300">
               <div className="mb-8 flex items-center justify-between">
                  <button onClick={() => setStep('org')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                     <ArrowLeft size={18} />
                     <span className="text-sm font-medium">切换组织</span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                     <Building size={14} className="text-blue-600" />
                     <span className="text-sm font-bold text-slate-800">{verifiedTenant ? existingTenants[verifiedTenant] : ''}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {/* HR Portal Card */}
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300 relative">
                    <div className="bg-slate-900 p-8 pb-10 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                          <ShieldCheck size={160} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Users className="text-blue-300" size={20} />
                              </div>
                              <span className="text-xs font-bold tracking-wider uppercase text-slate-400 border border-slate-700 px-2 py-0.5 rounded">Admin Portal</span>
                          </div>
                          <h2 className="text-2xl font-bold mb-2">HR 管理平台</h2>
                          <p className="text-slate-300 text-sm">Human Resources Business Partner</p>
                        </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        {!showAdminLoginInput ? (
                            <>
                                <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                                拥有全组织数据访问权限。负责配置盘点规则、发起校准流程以及生成集团级人才报告。
                                </p>
                                <div className="mt-auto space-y-4">
                                <button 
                                    onClick={() => {
                                        setShowAdminLoginInput(true);
                                        setPasswordError('');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-2"
                                >
                                    <span>管理员登录</span>
                                    <ArrowRight size={18} />
                                </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleHRLogin} className="mt-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">管理员密码</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => {
                                                setAdminPassword(e.target.value);
                                                setPasswordError('');
                                            }}
                                            placeholder="请输入Admin密码"
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                            autoFocus
                                        />
                                        <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                    {passwordError && (
                                        <div className="text-red-500 text-xs flex items-center gap-1">
                                            <AlertCircle size={12} /> {passwordError}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAdminLoginInput(false)}
                                        className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
                                    >
                                        返回
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium"
                                    >
                                        确认登录
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                  </div>

                  {/* Manager Portal Card */}
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 pb-10 text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                          <Briefcase size={160} />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Layout className="text-yellow-300" size={20} />
                              </div>
                              <span className="text-xs font-bold tracking-wider uppercase text-blue-200 border border-blue-500/50 px-2 py-0.5 rounded">Manager Portal</span>
                          </div>
                          <h2 className="text-2xl font-bold mb-2">业务管理者工作台</h2>
                          <p className="text-blue-100 text-sm">Line Manager / Department Head</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleManagerLogin} className="p-8 flex-1 flex flex-col">
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                          聚焦于您的团队。使用九宫格工具识别高潜人才，制定继任计划。
                        </p>
                        
                        <div className="mt-auto space-y-3">
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">选择部门 (Department)</label>
                                <div className="relative">
                                    <select 
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">请选择部门...</option>
                                        {availableDepts.length > 0 ? (
                                            availableDepts.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>暂无配置的部门账号 (请联系HR)</option>
                                        )}
                                    </select>
                                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">访问密码 (Access Key)</label>
                                <div className="relative">
                                    <input 
                                        type="password"
                                        value={managerPassword}
                                        onChange={(e) => {
                                            setManagerPassword(e.target.value);
                                            setPasswordError('');
                                        }}
                                        placeholder="请输入管理员分配的访问密码"
                                        className={`w-full bg-white border rounded-lg py-2.5 px-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300'}`}
                                        required
                                    />
                                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                {passwordError && !showAdminLoginInput && (
                                    <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} /> {passwordError}
                                    </div>
                                )}
                              </div>

                          <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2"
                          >
                              <span>进入部门工作台</span>
                              <ChevronRight size={18} />
                          </button>
                        </div>
                    </form>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      <div className="p-6 text-center text-slate-400 text-xs">
         © 2025 TalentFlow AI. Intelligent Talent Review System.
      </div>
    </div>
  );
};
