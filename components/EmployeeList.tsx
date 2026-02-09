import React, { useState, useMemo } from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';
import { Plus, Trash2, Edit2, X, Check, Copy } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onEmployeesChange?: (employees: Employee[]) => void;
}

interface EditingState {
  mode: 'view' | 'edit';
  editingRow?: string;
  editingCell?: { rowId: string; field: string };
  editValue?: string;
  columnEditing?: string;
  newColumnName?: string;
  customColumns: string[];
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEmployeesChange }) => {
  const [editingState, setEditingState] = useState<EditingState>({
    mode: 'view',
    customColumns: []
  });

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

  // Define default columns
  const defaultColumns = [
    { key: 'name', label: '姓名 / 职位', type: 'name' },
    { key: 'department', label: '部门', type: 'text' },
    { key: 'performance', label: '绩效', type: 'select' },
    { key: 'potential', label: '潜力', type: 'select' },
    { key: 'tenure', label: '司龄', type: 'number' },
    { key: 'flightRisk', label: '离职风险', type: 'select' }
  ];

  const allColumns = useMemo(() => {
    return [...defaultColumns, ...editingState.customColumns.map(col => ({
      key: col,
      label: col,
      type: 'text'
    }))];
  }, [editingState.customColumns]);

  const handleAddRow = () => {
    const newEmployee: Employee = {
      id: `new-${Date.now()}`,
      name: '新员工',
      role: '职位',
      department: '部门',
      avatar: `https://ui-avatars.com/api/?name=New&background=random`,
      performance: PerformanceLevel.Medium,
      potential: PotentialLevel.Medium,
      tenure: 0,
      flightRisk: 'Low',
      lastReviewDate: new Date().toISOString().split('T')[0],
      keyStrengths: [],
      developmentNeeds: [],
      successionStatus: 'None',
      targetRole: '',
      careerAspiration: ''
    };
    const updated = [...employees, newEmployee];
    onEmployeesChange?.(updated);
  };

  const handleDeleteRow = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    onEmployeesChange?.(updated);
  };

  const handleAddColumn = () => {
    const newColName = `自定义列${editingState.customColumns.length + 1}`;
    setEditingState(prev => ({
      ...prev,
      customColumns: [...prev.customColumns, newColName],
      columnEditing: newColName,
      newColumnName: newColName
    }));
  };

  const handleDeleteColumn = (colKey: string) => {
    if (defaultColumns.some(c => c.key === colKey)) {
      alert('不能删除默认列');
      return;
    }
    setEditingState(prev => ({
      ...prev,
      customColumns: prev.customColumns.filter(c => c !== colKey)
    }));
  };

  const handleRenameColumn = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    setEditingState(prev => ({
      ...prev,
      customColumns: prev.customColumns.map(c => c === oldName ? newName : c),
      columnEditing: undefined,
      newColumnName: undefined
    }));
  };

  const handleCellChange = (id: string, field: string, value: any) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onEmployeesChange?.(updated);
    setEditingState(prev => ({
      ...prev,
      editingCell: undefined,
      editValue: undefined
    }));
  };

  const renderCell = (emp: Employee, column: any) => {
    const isEditing = editingState.editingCell?.rowId === emp.id && editingState.editingCell?.field === column.key;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type={column.type === 'number' ? 'number' : 'text'}
            value={editingState.editValue || ''}
            onChange={(e) => setEditingState(prev => ({ ...prev, editValue: e.target.value }))}
            className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm"
            autoFocus
          />
          <button
            onClick={() => handleCellChange(emp.id, column.key, editingState.editValue)}
            className="text-green-600 hover:text-green-700"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => setEditingState(prev => ({ ...prev, editingCell: undefined }))}
            className="text-red-600 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      );
    }

    let displayValue = '';
    let className = '';

    if (column.key === 'name') {
      return (
        <div className="flex items-center gap-3">
          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-medium text-slate-900">{emp.name}</div>
            <div className="text-xs text-slate-500">{emp.role}</div>
          </div>
        </div>
      );
    } else if (column.key === 'performance') {
      displayValue = perfLabels[emp.performance];
      className = emp.performance === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600';
    } else if (column.key === 'potential') {
      displayValue = potLabels[emp.potential];
      className = emp.potential === 2 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600';
    } else if (column.key === 'tenure') {
      displayValue = `${emp.tenure} 年`;
    } else if (column.key === 'flightRisk') {
      displayValue = riskLabels[emp.flightRisk];
      className = riskColor(emp.flightRisk);
    } else if (column.key === 'department') {
      displayValue = emp.department;
    } else {
      displayValue = emp[column.key as keyof Employee]?.toString() || '-';
    }

    return (
      <div
        onClick={() => setEditingState(prev => ({
          ...prev,
          editingCell: { rowId: emp.id, field: column.key },
          editValue: displayValue
        }))}
        className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors ${
          ['performance', 'potential', 'flightRisk'].includes(column.key) 
            ? `px-2 py-1 rounded-full text-xs font-medium ${className}`
            : ''
        }`}
      >
        {displayValue}
      </div>
    );
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">基础数据 ({employees.length})</h2>
        <div className="flex gap-2">
          {editingState.mode === 'view' ? (
            <button
              onClick={() => setEditingState(prev => ({ ...prev, mode: 'edit' }))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={16} />
              编辑表格
            </button>
          ) : (
            <button
              onClick={() => setEditingState(prev => ({ ...prev, mode: 'view' }))}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X size={16} />
              完成编辑
            </button>
          )}
        </div>
      </div>

      {editingState.mode === 'edit' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} />
            添加行
          </button>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} />
            添加列
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold sticky top-0">
            <tr>
              {editingState.mode === 'edit' && (
                <th className="px-4 py-4 w-12 text-center">操作</th>
              )}
              {allColumns.map(col => (
                <th key={col.key} className="px-6 py-4 relative group">
                  {editingState.columnEditing === col.key ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingState.newColumnName || ''}
                        onChange={(e) => setEditingState(prev => ({ ...prev, newColumnName: e.target.value }))}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameColumn(col.key, editingState.newColumnName || '')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingState(prev => ({ ...prev, columnEditing: undefined }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{col.label}</span>
                      {editingState.mode === 'edit' && !defaultColumns.some(c => c.key === col.key) && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => setEditingState(prev => ({
                              ...prev,
                              columnEditing: col.key,
                              newColumnName: col.label
                            }))}
                            className="text-blue-600 hover:text-blue-700"
                            title="重命名"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(col.key)}
                            className="text-red-600 hover:text-red-700"
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                {editingState.mode === 'edit' && (
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleDeleteRow(emp.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      title="删除行"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
                {allColumns.map(col => (
                  <td key={`${emp.id}-${col.key}`} className="px-6 py-4">
                    {renderCell(emp, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
