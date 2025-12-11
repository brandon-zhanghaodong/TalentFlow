
import React, { useMemo } from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';
import { Layers, AlertTriangle, Users, TrendingUp, Briefcase, Clock } from 'lucide-react';

export const AnalyticsView: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const total = employees.length;
  
  // Helpers
  const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

  // 1. Risk Analysis: High Potential but High Risk
  const criticalRiskEmployees = useMemo(() => {
    return employees.filter(e => 
      (e.potential === PotentialLevel.High || e.performance === PerformanceLevel.High) && 
      e.flightRisk === 'High'
    );
  }, [employees]);

  // 2. Tenure Distribution
  const tenureDist = useMemo(() => {
    const dist = { '< 1年': 0, '1-3 年': 0, '3-5 年': 0, '> 5 年': 0 };
    employees.forEach(e => {
      if (e.tenure < 1) dist['< 1年']++;
      else if (e.tenure <= 3) dist['1-3 年']++;
      else if (e.tenure <= 5) dist['3-5 年']++;
      else dist['> 5 年']++;
    });
    return dist;
  }, [employees]);

  // 3. Succession Coverage (Key Roles with Ready-Now successors)
  const successionStats = useMemo(() => {
    // Identify target roles
    const targetRoles = new Set(employees.map(e => e.targetRole).filter(Boolean));
    const coveredRoles = new Set(employees.filter(e => e.successionStatus === 'Ready-Now').map(e => e.targetRole));
    
    // Simplistic metric: How many unique roles have a ready-now successor?
    // In a real app, we'd compare against a fixed list of Critical Roles.
    const totalKeyRoles = targetRoles.size || 1; // Avoid divide by zero
    const coveredCount = coveredRoles.size;
    
    return {
      rate: Math.round((coveredCount / totalKeyRoles) * 100),
      count: coveredCount,
      total: totalKeyRoles
    }
  }, [employees]);

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <TrendingUp className="text-blue-600" /> 组织效能与风险分析
      </h2>
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <div className="text-slate-500 text-sm font-medium mb-1">继任健康度 (Ready-Now)</div>
             <div className="text-3xl font-bold text-slate-800">{successionStats.rate}%</div>
             <div className="text-xs text-slate-400 mt-1">{successionStats.count} / {successionStats.total} 关键岗位有即任者</div>
           </div>
           <div className="bg-green-50 p-3 rounded-full text-green-600">
             <Briefcase size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <div className="text-slate-500 text-sm font-medium mb-1">高潜离职风险</div>
             <div className="text-3xl font-bold text-red-600">{criticalRiskEmployees.length} 人</div>
             <div className="text-xs text-slate-400 mt-1">需立即介入保留</div>
           </div>
           <div className="bg-red-50 p-3 rounded-full text-red-600">
             <AlertTriangle size={24} />
           </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <div className="text-slate-500 text-sm font-medium mb-1">平均司龄</div>
             <div className="text-3xl font-bold text-blue-600">
                {(employees.reduce((acc, curr) => acc + curr.tenure, 0) / (total || 1)).toFixed(1)} 年
             </div>
             <div className="text-xs text-slate-400 mt-1">组织稳定性指标</div>
           </div>
           <div className="bg-blue-50 p-3 rounded-full text-blue-600">
             <Clock size={24} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tenure Structure */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Layers size={18} className="text-slate-400"/> 司龄结构分布
          </h3>
          <div className="space-y-4">
            {Object.entries(tenureDist).map(([label, count]) => (
              <div key={label}>
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>{label}</span>
                  <span className="font-medium">{count} 人 ({getPercent(count as number)}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${getPercent(count as number)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Risk Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} /> 核心流失预警 (High Risk)
          </h3>
          <p className="text-xs text-slate-500 mb-4">以下为高绩效/高潜且被标记为高离职风险的员工：</p>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {criticalRiskEmployees.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-normal">
                    <th className="pb-2">姓名</th>
                    <th className="pb-2">部门</th>
                    <th className="pb-2">绩效/潜力</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {criticalRiskEmployees.map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 font-medium text-slate-700 flex items-center gap-2">
                        <img src={e.avatar} className="w-6 h-6 rounded-full" />
                        {e.name}
                      </td>
                      <td className="py-2 text-slate-500">{e.department}</td>
                      <td className="py-2">
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Star</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-32 text-green-500 bg-green-50 rounded-lg">
                <span className="flex items-center gap-2 text-sm font-medium">
                   <Users size={16} /> 目前无核心人才流失风险
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
