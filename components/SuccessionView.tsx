
import React, { useMemo } from 'react';
import { Employee, PotentialLevel, PerformanceLevel } from '../types';
import { Users, ArrowUpRight, ShieldCheck, Clock, AlertTriangle, Briefcase, CheckCircle2, Layers } from 'lucide-react';

interface SuccessionViewProps {
  employees: Employee[];
  contextTitle?: string;
}

export const SuccessionView: React.FC<SuccessionViewProps> = ({ employees, contextTitle = '当前范围' }) => {
  
  // 1. Identify Key Roles logic
  // Roles held by Top Talent OR Roles that are targeted by someone
  const keyRolesData = useMemo(() => {
    const roleMap = new Map<string, { incumbents: Employee[], successors: Employee[] }>();
    
    employees.forEach(e => {
      // If employee is high potential or high performance, their CURRENT role is a key role
      if (e.potential === PotentialLevel.High || e.performance === PerformanceLevel.High) {
        if (!roleMap.has(e.role)) roleMap.set(e.role, { incumbents: [], successors: [] });
        roleMap.get(e.role)?.incumbents.push(e);
      }
      
      // If employee has a target role, that TARGET role is a key role
      if (e.targetRole) {
        if (!roleMap.has(e.targetRole)) roleMap.set(e.targetRole, { incumbents: [], successors: [] });
        roleMap.get(e.targetRole)?.successors.push(e);
      }
    });

    // Also try to find incumbents for target roles if they exist in the current filtered list
    // (This handles cases where the role wasn't added by the incumbent logic above)
    employees.forEach(e => {
      if (roleMap.has(e.role) && !roleMap.get(e.role)?.incumbents.includes(e)) {
         // Only add if not already there (though logic above usually catches High/High)
         // Actually, let's add all incumbents we can find for the identified key roles
         roleMap.get(e.role)?.incumbents.push(e);
      }
    });

    // Deduplicate incumbents just in case
    Array.from(roleMap.values()).forEach(val => {
       val.incumbents = Array.from(new Set(val.incumbents));
    });

    return Array.from(roleMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [employees]);

  // 2. Calculate Stats
  const stats = useMemo(() => {
    const totalRoles = keyRolesData.length;
    const coveredRoles = keyRolesData.filter(([_, data]) => 
      data.successors.some(s => s.successionStatus === 'Ready-Now')
    ).length;
    const totalSuccessors = keyRolesData.reduce((acc, [_, data]) => acc + data.successors.length, 0);
    
    return {
      coverage: totalRoles > 0 ? Math.round((coveredRoles / totalRoles) * 100) : 0,
      totalRoles,
      totalSuccessors
    };
  }, [keyRolesData]);

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-blue-600" /> 继任者地图 (Succession Map)
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            范围: <span className="font-semibold text-slate-700">{contextTitle}</span>。
            展示关键岗位的板凳深度与人才梯队健康度。
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">岗位覆盖率 (Ready-Now)</div>
              <div className={`text-xl font-bold ${stats.coverage >= 80 ? 'text-green-600' : stats.coverage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats.coverage}%
              </div>
           </div>
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">关键岗位数</div>
              <div className="text-xl font-bold text-slate-800">{stats.totalRoles}</div>
           </div>
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold">储备人才总数</div>
              <div className="text-xl font-bold text-blue-600">{stats.totalSuccessors}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {keyRolesData.map(([role, { incumbents, successors }]) => {
          const hasReadyNow = successors.some(s => s.successionStatus === 'Ready-Now');
          
          return (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              {/* Role Header */}
              <div className={`px-5 py-4 border-b border-slate-100 flex justify-between items-center ${hasReadyNow ? 'bg-green-50/50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                   <Briefcase size={16} className="text-slate-400 flex-shrink-0" />
                   <h3 className="font-bold text-slate-800 truncate text-sm md:text-base" title={role}>{role}</h3>
                </div>
                {hasReadyNow && (
                   <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle2 size={10} /> 健康
                   </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col gap-5">
                {/* Incumbent Section */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ShieldCheck size={12} /> 现任者 (Incumbents)
                  </div>
                  {incumbents.length > 0 ? (
                    <div className="space-y-2">
                      {incumbents.map(inc => (
                        <div key={inc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50 relative group transition-colors hover:border-blue-200">
                          <img src={inc.avatar} alt={inc.name} className="w-9 h-9 rounded-full border border-white shadow-sm object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <div className="text-sm font-bold text-slate-800 truncate">{inc.name}</div>
                               {inc.flightRisk === 'High' && (
                                 <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-1.5 rounded" title="高离职风险">
                                   <AlertTriangle size={10} /> 风险
                                 </div>
                               )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {inc.potential === PotentialLevel.High && (
                                <span className="text-[10px] font-semibold text-yellow-700">★ High Pot</span>
                              )}
                              <span className="text-[10px] text-slate-400">司龄 {inc.tenure}年</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="p-3 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50">
                        <span className="text-xs text-slate-400 italic">当前视野下无现任者数据</span>
                     </div>
                  )}
                </div>

                {/* Timeline Connector Visual */}
                <div className="relative h-4 w-full">
                   <div className="absolute top-1/2 left-0 w-full border-t border-slate-100"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] text-slate-300 font-medium">
                      继任梯队
                   </div>
                </div>

                {/* Successors Section */}
                <div className="flex-1">
                  {successors.length > 0 ? (
                    <div className="space-y-4">
                      {/* Ready Now Group */}
                      {(() => {
                        const readyNow = successors.filter(s => s.successionStatus === 'Ready-Now');
                        if (readyNow.length === 0) return null;
                        return (
                          <div className="space-y-2">
                             <div className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                <ArrowUpRight size={12} /> 即任 (Ready-Now)
                             </div>
                             {readyNow.map(succ => (
                               <SuccessorCard key={succ.id} employee={succ} color="border-green-100 bg-green-50/30" />
                             ))}
                          </div>
                        );
                      })()}

                      {/* Ready Future Group */}
                      {(() => {
                        const readyFuture = successors.filter(s => s.successionStatus === 'Ready-Future');
                        if (readyFuture.length === 0) return null;
                        return (
                          <div className="space-y-2">
                             <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                <Clock size={12} /> 1-2年 (Ready-Future)
                             </div>
                             {readyFuture.map(succ => (
                               <SuccessorCard key={succ.id} employee={succ} color="border-blue-100 bg-blue-50/30" />
                             ))}
                          </div>
                        );
                      })()}

                       {/* Unspecified Group (if any have target role but no status) */}
                       {(() => {
                        const others = successors.filter(s => s.successionStatus === 'None');
                        if (others.length === 0) return null;
                        return (
                          <div className="space-y-2">
                             <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                储备库
                             </div>
                             {others.map(succ => (
                               <SuccessorCard key={succ.id} employee={succ} color="border-slate-100 bg-slate-50" />
                             ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-red-200 bg-red-50/10 rounded-lg">
                       <AlertTriangle size={16} className="mb-1 text-red-300" />
                       无指定继任者
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
        
        {keyRolesData.length === 0 && (
           <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Layers size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">暂无继任数据</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                 当前筛选范围内没有被标记为高潜/高绩的关键人才，或者尚未设定目标岗位。请尝试切换部门或在人才档案中添加目标岗位。
              </p>
           </div>
        )}
      </div>
    </div>
  );
};

const SuccessorCard: React.FC<{ employee: Employee; color: string }> = ({ employee, color }) => (
  <div className={`flex items-center gap-3 p-2 rounded-lg border ${color} transition-all hover:shadow-sm`}>
    <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full opacity-90 object-cover" />
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-800 truncate">{employee.name}</div>
      <div className="text-[10px] text-slate-500 truncate">{employee.role} · {employee.department}</div>
    </div>
  </div>
);
