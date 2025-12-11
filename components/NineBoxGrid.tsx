import React from 'react';
import { Employee, GridCellDef, PerformanceLevel, PotentialLevel } from '../types';
import { GRID_CELLS } from '../constants';
import { EmployeeCard } from './EmployeeCard';

interface NineBoxGridProps {
  employees: Employee[];
  onMoveEmployee: (id: string, perf: PerformanceLevel, pot: PotentialLevel) => void;
  onSelectEmployee: (employee: Employee) => void;
}

export const NineBoxGrid: React.FC<NineBoxGridProps> = ({ employees, onMoveEmployee, onSelectEmployee }) => {

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
  // Rows: High Pot (2), Med Pot (1), Low Pot (0)
  // Cols: Low Perf (0), Med Perf (1), High Perf (2)
  const rows = [PotentialLevel.High, PotentialLevel.Medium, PotentialLevel.Low];
  const cols = [PerformanceLevel.Low, PerformanceLevel.Medium, PerformanceLevel.High];

  return (
    <div className="flex-1 p-6 overflow-auto" id="nine-box-grid-container">
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