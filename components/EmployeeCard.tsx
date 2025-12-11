import React from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';
import { GripVertical, AlertTriangle, Star } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('employeeId', employee.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(employee)}
      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-blue-400 transition-all group flex items-start gap-3 relative"
    >
      <div className="flex-shrink-0">
        <img 
          src={employee.avatar} 
          alt={employee.name} 
          className="w-10 h-10 rounded-full object-cover border border-slate-100"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-semibold text-slate-800 truncate">{employee.name}</h4>
          {employee.flightRisk === 'High' && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          )}
           {employee.performance === PerformanceLevel.High && employee.potential === PotentialLevel.High && (
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{employee.role}</p>
        <div className="mt-1 flex gap-1">
           <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            {employee.department}
           </span>
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-400">
        <GripVertical size={14} />
      </div>
    </div>
  );
};
