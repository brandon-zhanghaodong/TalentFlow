
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NineBoxGrid } from './components/NineBoxGrid';
import { EmployeeList } from './components/EmployeeList';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { SuccessionView } from './components/SuccessionView';
import { TalentDrawer } from './components/TalentDrawer';
import { HomeChat } from './components/HomeChat';
import { ActionPlanView } from './components/ActionPlanView';
import { LoginScreen } from './components/LoginScreen';
import { MOCK_TENANTS, TENANT_META, generateSeedEmployees } from './constants';
import { Employee, PerformanceLevel, PotentialLevel, View, User, AuthStore } from './types';
import { LogOut } from 'lucide-react';

// Initial Seed Auth Data (Default passwords for demo)
const INITIAL_AUTH_STORE: AuthStore = {
  'tech_corp': {
    adminPassword: 'admin', // Default Admin Pwd
    managerPasswords: {
      '产品部': '123456',
      '研发部': '123456',
      '销售部': '123456',
      '法务部': '123456',
      '管理层': '123456',
      '运营部': '123456'
    }
  },
  'retail_grp': {
    adminPassword: 'admin',
    managerPasswords: {
      '区域运营部': '888888',
      '门店管理部': '888888'
    }
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string>('');
  
  // --- STATE FOR MULTI-TENANCY & AUTH ---
  const [allTenants, setAllTenants] = useState<Record<string, Employee[]>>(MOCK_TENANTS);
  const [allTenantMeta, setAllTenantMeta] = useState<Record<string, string>>(TENANT_META);
  const [authStore, setAuthStore] = useState<AuthStore>(INITIAL_AUTH_STORE);

  // Initialize with empty, as we wait for Tenant Login to load data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<View>('login'); 
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [title, setTitle] = useState("2025年度人才盘点"); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Initialize view based on login status
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('login');
    } else {
      setCurrentView('home');
      // Set default department filter based on role
      if (currentUser.role === 'MANAGER' && currentUser.department) {
        setSelectedDept(currentUser.department);
      } else {
        setSelectedDept('All');
      }
    }
  }, [currentUser]);

  // Compute unique departments from the current employee list
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Filter employees based on selection AND User Role
  const filteredEmployees = useMemo(() => {
    // If Manager, FORCE filter to their department regardless of selectedDept state
    if (currentUser?.role === 'MANAGER' && currentUser.department) {
      return employees.filter(e => e.department === currentUser.department);
    }
    // If HR, use the dropdown state
    if (selectedDept === 'All') return employees;
    return employees.filter(e => e.department === selectedDept);
  }, [employees, selectedDept, currentUser]);

  const handleMoveEmployee = (id: string, newPerf: PerformanceLevel, newPot: PotentialLevel) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        if (emp.performance === newPerf && emp.potential === newPot) return emp;
        return { ...emp, performance: newPerf, potential: newPot };
      }
      return emp;
    }));
  };

  const handleImportEmployees = (newEmployees: Employee[]) => {
    setEmployees(prev => [...prev, ...newEmployees]);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseDrawer = () => {
    setSelectedEmployee(null);
  };

  // --- AUTH HANDLERS ---

  const handleLogin = (user: User, tenantId: string) => {
    setCurrentUser(user);
    setCurrentTenantId(tenantId);
    // Load data specific to the logged-in tenant from our State
    if (allTenants[tenantId]) {
       setEmployees(allTenants[tenantId]);
    }
    // Update Title
    const tenantName = allTenantMeta[tenantId] || 'My Company';
    setTitle(`${tenantName} - 2025人才盘点`);
  };

  const handleRegister = (tenantId: string, tenantName: string, adminName: string, adminPassword: string) => {
    // 1. Create Seed Data
    const seedEmployees = generateSeedEmployees(tenantName);
    
    // 2. Update Tenant State
    setAllTenants(prev => ({
      ...prev,
      [tenantId]: seedEmployees
    }));
    
    setAllTenantMeta(prev => ({
      ...prev,
      [tenantId]: tenantName
    }));

    // 3. Initialize Auth Store for new tenant
    setAuthStore(prev => ({
      ...prev,
      [tenantId]: {
        adminPassword: adminPassword,
        managerPasswords: {} // No managers yet
      }
    }));

    // 4. Auto Login as HR Admin
    const adminUser: User = {
      id: 'admin-' + tenantId,
      name: adminName,
      role: 'HR_BP',
      avatar: `https://ui-avatars.com/api/?name=${adminName.replace(' ', '+')}&background=0D8ABC&color=fff`
    };
    
    setCurrentUser(adminUser);
    setCurrentTenantId(tenantId);
    setEmployees(seedEmployees);
    setTitle(`${tenantName} - 2025人才盘点`);
  };

  const handleUpdatePassword = (deptName: string, newPassword: string) => {
    if (!currentTenantId) return;
    setAuthStore(prev => ({
      ...prev,
      [currentTenantId]: {
        ...prev[currentTenantId],
        managerPasswords: {
          ...prev[currentTenantId].managerPasswords,
          [deptName]: newPassword
        }
      }
    }));
  };

  const handleAddManager = (deptName: string, password: string) => {
    if (!currentTenantId) return;
    setAuthStore(prev => ({
      ...prev,
      [currentTenantId]: {
        ...prev[currentTenantId],
        managerPasswords: {
          ...prev[currentTenantId].managerPasswords,
          [deptName]: password
        }
      }
    }));
  }

  const handleRemoveManager = (deptName: string) => {
    if (!currentTenantId) return;
    setAuthStore(prev => {
      const newPasswords = { ...prev[currentTenantId].managerPasswords };
      delete newPasswords[deptName];
      return {
        ...prev,
        [currentTenantId]: {
          ...prev[currentTenantId],
          managerPasswords: newPasswords
        }
      };
    });
  }

  const confirmLogout = () => {
    setCurrentUser(null);
    setCurrentTenantId('');
    setSelectedDept('All');
    setEmployees([]); // Clear data on logout
    setShowLogoutConfirm(false);
  };

  // --- RENDER ---

  if (!currentUser) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        existingTenants={allTenantMeta}
        authStore={authStore}
      />
    );
  }

  // Derive display context title
  const contextTitle = currentUser.role === 'MANAGER' 
    ? (currentUser.department || 'My Department') 
    : (selectedDept === 'All' ? '全公司' : selectedDept);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={() => setShowLogoutConfirm(true)}
        currentUser={currentUser}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dashboard is visible on data-heavy views, hidden on Home/Chat to avoid clutter */}
        {currentView !== 'home' && currentView !== 'settings' && (
          <Dashboard 
            employees={filteredEmployees} 
            departments={departments}
            selectedDept={currentUser.role === 'MANAGER' ? (currentUser.department || 'All') : selectedDept}
            onFilterChange={setSelectedDept}
            onImport={handleImportEmployees}
            title={title}
            onTitleChange={setTitle}
            currentUser={currentUser}
          />
        )}
        
        <div className="flex-1 flex overflow-hidden relative">
          {currentView === 'home' && (
            <HomeChat 
              employees={filteredEmployees} 
              title={title}
              onTitleChange={setTitle}
              onNavigate={setCurrentView}
              currentUser={currentUser}
            />
          )}
          {currentView === 'grid' && (
            <NineBoxGrid 
              employees={filteredEmployees} 
              onMoveEmployee={handleMoveEmployee}
              onSelectEmployee={handleSelectEmployee}
            />
          )}
          {currentView === 'list' && (
            <EmployeeList employees={filteredEmployees} />
          )}
          {currentView === 'analytics' && (
             <AnalyticsView employees={filteredEmployees} />
          )}
          {currentView === 'succession' && (
             <SuccessionView 
                employees={filteredEmployees} 
                contextTitle={contextTitle}
             />
          )}
          {currentView === 'plan' && (
             <ActionPlanView 
               currentUser={currentUser} 
               selectedDept={currentUser.role === 'MANAGER' ? (currentUser.department || 'All') : selectedDept}
             />
          )}
          {currentView === 'settings' && (
             <SettingsView 
                currentUser={currentUser}
                departments={departments}
                tenantAuth={authStore[currentTenantId]}
                onUpdatePassword={handleUpdatePassword}
                onAddManager={handleAddManager}
                onRemoveManager={handleRemoveManager}
             />
          )}
          
          <TalentDrawer 
            employee={selectedEmployee} 
            onClose={handleCloseDrawer} 
          />
        </div>
        
        {/* Logout Modal Overlay */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-100 transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                   <div className="p-2 bg-red-100 rounded-full">
                     <LogOut size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">确认退出?</h3>
                </div>
                <p className="text-slate-600 mb-6 text-sm">
                  您确定要退出当前账号吗？未保存的草稿可能会丢失。
                </p>
                <div className="flex justify-end gap-3">
                   <button 
                     onClick={() => setShowLogoutConfirm(false)}
                     className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                   >
                     取消
                   </button>
                   <button 
                     onClick={confirmLogout}
                     className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-md transition-colors"
                   >
                     确认退出
                   </button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
