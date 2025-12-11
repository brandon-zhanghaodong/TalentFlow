
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NineBoxGrid } from './components/NineBoxGrid';
import { EmployeeList } from './components/EmployeeList';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { SuccessionView } from './components/SuccessionView';
import { TalentDrawer } from './components/TalentDrawer';
import { INITIAL_EMPLOYEES } from './constants';
import { Employee, PerformanceLevel, PotentialLevel, View } from './types';

function App() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<View>('grid');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Compute unique departments from the current employee list
  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Filter employees based on selection
  const filteredEmployees = useMemo(() => {
    if (selectedDept === 'All') return employees;
    return employees.filter(e => e.department === selectedDept);
  }, [employees, selectedDept]);

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

  const handleLogout = () => {
    if (window.confirm("确定要退出 TalentFlow 系统吗?")) {
      // Mock logout
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Dashboard always visible at top (unless in settings maybe, but keeping consistent) */}
        {currentView !== 'settings' && (
          <Dashboard 
            employees={filteredEmployees} 
            departments={departments}
            selectedDept={selectedDept}
            onFilterChange={setSelectedDept}
            onImport={handleImportEmployees} 
          />
        )}
        
        <div className="flex-1 flex overflow-hidden relative">
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
             <SuccessionView employees={filteredEmployees} />
          )}
          {currentView === 'settings' && (
             <SettingsView />
          )}
          
          <TalentDrawer 
            employee={selectedEmployee} 
            onClose={handleCloseDrawer} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
