
import React, { useState } from 'react';
import { Employee, GridCellDef, PerformanceLevel, PotentialLevel } from '../types';
import { GRID_CELLS } from '../constants';
import { EmployeeCard } from './EmployeeCard';
import { Info, X } from 'lucide-react';

interface NineBoxGridProps {
  employees: Employee[];
  onMoveEmployee: (id: string, perf: PerformanceLevel, pot: PotentialLevel) => void;
  onSelectEmployee: (employee: Employee) => void;
}

export const NineBoxGrid: React.FC<NineBoxGridProps> = ({ employees, onMoveEmployee, onSelectEmployee }) => {
  const [showGuide, setShowGuide] = useState(true);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, cell: GridCellDef) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId) {
      onMoveEmployee(employeeId, cell.performance, cell.potential);
    }
  };

  // Sort cells to render in a 3x3 visual grid (High Pot top, Low Pot bottom)
  const rows = [PotentialLevel.High, PotentialLevel.Medium, PotentialLevel.Low];
  const cols = [PerformanceLevel.Low, PerformanceLevel.Medium, PerformanceLevel.High];

  return (
    <div className="flex-1 p-6 overflow-auto" id="nine-box-grid-container">
      
      {/* User Guide Banner */}
      {showGuide && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between animate-in slide-in-from-top-2">
          <div className="flex gap-3">
             <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5">
               <Info size={18} />
             </div>
             <div>
               <h4 className="text-sm font-bold text-blue-800 mb-1">如何使用九宫格校准？</h4>
               <ul className="text-sm text-blue-700 list-disc list-inside space-y-0.5">
                 <li><strong>拖拽操作</strong>：按住员工卡片，将其拖动到符合其绩效与潜力的格子中。</li>
                 <li><strong>查看详情</strong>：点击任意员工卡片，唤出右侧详情页，使用 AI 生成诊断与发展建议。</li>
               </ul>
             </div>
          </div>
          <button onClick={() => setShowGuide(false)} className="text-blue-400 hover:text-blue-600">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-4 h-full min-h-[800px]">
        {/* Y-Axis Label */}
        <div className="flex items-center justify-center">
          <div className="-rotate-90 font-bold text-slate-400 tracking-wider text-sm whitespace-nowrap">
            潜 力 (POTENTIAL)
          </div>
        </div>

        <div className="grid grid-rows-[1fr_auto] gap-4 h-full">
          {/* Main Grid */}
          <div className="grid grid-rows-3 grid-cols-3 gap-4 h-full border-l-2 border-b-2 border-slate-200 pl-4 pb-4">
            {rows.map((rowPot) => (
              <React.Fragment key={`row-${rowPot}`}>
                {cols.map((colPerf) => {
                  const cellDef = GRID_CELLS.find(c => c.performance === colPerf && c.potential === rowPot);
                  if (!cellDef) return <div key={`empty-${rowPot}-${colPerf}`} />;

                  const cellEmployees = employees.filter(e => e.performance === colPerf && e.potential === rowPot);

                  return (
                    <div
                      key={cellDef.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, cellDef)}
                      className={`${cellDef.bg} border-2 border-transparent hover:border-blue-300 rounded-xl p-3 flex flex-col transition-colors duration-200`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-sm ${cellDef.color}`}>{cellDef.title}</h3>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{cellDef.description}</p>
                        </div>
                        <span className="bg-white/50 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                          {cellEmployees.length}
                        </span>
                      </div>
                      
                      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                        {cellEmployees.map(emp => (
                          <EmployeeCard key={emp.id} employee={emp} onClick={onSelectEmployee} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* X-Axis Label */}
          <div className="grid grid-cols-3 text-center font-bold text-slate-400 tracking-wider text-sm">
             <div>低绩效 (LOW)</div>
             <div>中绩效 (MEDIUM)</div>
             <div>高绩效 (HIGH)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
