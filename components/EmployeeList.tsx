import React from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';

interface EmployeeListProps {
  employees: Employee[];
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees }) => {
  const perfLabels = { [PerformanceLevel.Low]: '低', [PerformanceLevel.Medium]: '中', [PerformanceLevel.High]: '高' };
  const potLabels = { [PotentialLevel.Low]: '低', [PotentialLevel.Medium]: '中', [PotentialLevel.High]: '高' };
  const riskLabels = { 'Low': '低', 'Medium': '中', 'High': '高' };

  const riskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">员工名册 ({employees.length})</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold">
            <tr>
              <th className="px-6 py-4">姓名 / 职位</th>
              <th className="px-6 py-4">部门</th>
              <th className="px-6 py-4">绩效</th>
              <th className="px-6 py-4">潜力</th>
              <th className="px-6 py-4">司龄</th>
              <th className="px-6 py-4">离职风险</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{emp.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.performance === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {perfLabels[emp.performance]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.potential === 2 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {potLabels[emp.potential]}
                  </span>
                </td>
                <td className="px-6 py-4">{emp.tenure} 年</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(emp.flightRisk)}`}>
                    {riskLabels[emp.flightRisk]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};