
import React, { useMemo } from 'react';
import { Employee, PotentialLevel, PerformanceLevel } from '../types';
import { User, Users, ArrowUpRight, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

interface SuccessionViewProps {
  employees: Employee[];
}

export const SuccessionView: React.FC<SuccessionViewProps> = ({ employees }) => {
  
  // 1. Identify Key Roles:
  // - Roles currently held by High Potential / High Perf employees
  // - OR Roles that are listed as "Target Role" by anyone
  const keyRoles = useMemo(() => {
    const roles = new Set<string>();
    
    // Add roles of superstars (incumbents who are valuable)
    employees.forEach(e => {
      if (e.potential === PotentialLevel.High || e.performance === PerformanceLevel.High) {
        roles.add(e.role);
      }
      // Add roles that people want to be promoted to
      if (e.targetRole) {
        roles.add(e.targetRole);
      }
    });

    return Array.from(roles).sort();
  }, [employees]);

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="text-blue-600" /> 继任者地图 (Succession Map)
        </h2>
        <p className="text-slate-500 mt-2">
          展示关键岗位的现任者状态及板凳深度 (Ready-Now / Ready-Future)。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyRoles.map(role => {
          // Find Incumbents (Current holders)
          const incumbents = employees.filter(e => e.role === role);
          // Find Successors (People targeting this role)
          const successors = employees.filter(e => e.targetRole === role);

          // Skip if no data relevant to succession
          if (incumbents.length === 0 && successors.length === 0) return null;

          return (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              {/* Role Header */}
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 truncate" title={role}>{role}</h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                   板凳深度: {successors.length}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-4">
                {/* Incumbent Section */}
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <ShieldCheck size={12} /> 现任者 (Incumbents)
                  </div>
                  {incumbents.length > 0 ? (
                    <div className="space-y-2">
                      {incumbents.map(inc => (
                        <div key={inc.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50 relative group">
                          <img src={inc.avatar} alt={inc.name} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <div className="text-sm font-medium text-slate-900 truncate">{inc.name}</div>
                               {inc.flightRisk === 'High' && (
                                 <span title="高离职风险">
                                   <AlertTriangle size={12} className="text-red-500" />
                                 </span>
                               )}
                            </div>
                            <div className="flex gap-1 mt-0.5">
                              {inc.potential === PotentialLevel.High && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded">High Pot</span>
                              )}
                              <span className="text-[10px] text-slate-400">{inc.tenure}年</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="text-sm text-red-400 italic px-2">职位空缺</div>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                   <div className="absolute inset-0 flex items-center" aria-hidden="true">
                     <div className="w-full border-t border-slate-200"></div>
                   </div>
                   <div className="relative flex justify-center">
                     <span className="bg-white px-2 text-xs text-slate-400">继任梯队</span>
                   </div>
                </div>

                {/* Successors Section */}
                <div className="flex-1">
                  {successors.length > 0 ? (
                    <div className="space-y-3">
                      {/* Group by status */}
                      {['Ready-Now', 'Ready-Future'].map((status) => {
                         const group = successors.filter(s => s.successionStatus === status);
                         if (group.length === 0) return null;
                         
                         return (
                           <div key={status}>
                              <div className="text-[10px] font-bold text-blue-600 mb-1 flex items-center gap-1">
                                {status === 'Ready-Now' ? <ArrowUpRight size={10} /> : <Clock size={10} />}
                                {status}
                              </div>
                              <div className="space-y-2">
                                {group.map(succ => (
                                  <div key={succ.id} className="flex items-center gap-3 p-2 rounded-lg border border-blue-50 bg-blue-50/30 hover:bg-blue-50 transition-colors">
                                    <img src={succ.avatar} alt={succ.name} className="w-8 h-8 rounded-full opacity-80" />
                                    <div>
                                      <div className="text-sm font-medium text-slate-800">{succ.name}</div>
                                      <div className="text-[10px] text-slate-500">{succ.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                           </div>
                         )
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-4 border border-dashed border-slate-200 rounded-lg">
                       无指定继任者
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
