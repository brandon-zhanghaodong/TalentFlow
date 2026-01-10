
import React, { useState, useRef, useEffect } from 'react';
import { ActionItem, User } from '../types';
import { Plus, Trash2, FileDown, FileText, ClipboardList, Lock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ActionPlanViewProps {
  currentUser: User;
  selectedDept: string;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ currentUser, selectedDept }) => {
  const isManager = currentUser.role === 'MANAGER';
  
  const getContextTitle = () => {
     if (isManager) return currentUser.department || '我的部门';
     return selectedDept === 'All' ? '全公司' : selectedDept;
  };

  const [department, setDepartment] = useState(getContextTitle());
  
  // Mock data generator based on department context with specific templates
  const getInitialItems = (deptName: string): ActionItem[] => {
    const isSales = deptName.includes('销售') || deptName.includes('Sales') || deptName.includes('业务') || deptName.includes('Retail');
    const isTech = deptName.includes('研发') || deptName.includes('技术') || deptName.includes('产品') || deptName.includes('R&D');
    const isHR = deptName.includes('HR') || deptName.includes('人力') || deptName.includes('人事');
    const isLegal = deptName.includes('法务') || deptName.includes('Legal');

    if (isSales) {
        return [
            { id: '1', category: 'HighPotential', action: `启动“${deptName}销冠俱乐部”领导力培养`, owner: '销售总监', deadline: '2025-06-30', status: 'In Progress' },
            { id: '2', category: 'Underperformer', action: '执行末位淘汰与业绩改进计划 (PIP)', owner: '区域经理', deadline: '2025-03-31', status: 'Pending' },
            { id: '3', category: 'Succession', action: '储备大区经理继任人选并轮岗', owner: 'HRBP', deadline: '2025-09-30', status: 'Pending' },
        ];
    }
    
    if (isTech) {
        return [
             { id: '1', category: 'HighPotential', action: `设立首席架构师/技术专家轮岗机制`, owner: 'CTO', deadline: '2025-08-30', status: 'In Progress' },
             { id: '2', category: 'Succession', action: '关键技术栈(AI/Cloud)专家备份计划', owner: '技术VP', deadline: '2025-05-30', status: 'Pending' },
             { id: '3', category: 'General', action: '技术职级晋升评审 (T6-T8)', owner: '技术委员会', deadline: '2025-04-15', status: 'In Progress' },
        ];
    }

    if (isHR) {
        return [
             { id: '1', category: 'General', action: `2025全员人才盘点校准会组织`, owner: 'OD负责人', deadline: '2025-02-28', status: 'In Progress' },
             { id: '2', category: 'HighPotential', action: '集团高潜人才库(HiPo)更新', owner: 'HRBP Head', deadline: '2025-03-15', status: 'Pending' },
             { id: '3', category: 'Succession', action: '核心高管继任计划回顾与汇报', owner: 'CHO', deadline: '2025-06-30', status: 'Pending' },
        ];
    }

    if (isLegal) {
        return [
             { id: '1', category: 'Succession', action: '总法务顾问继任者培养', owner: 'General Counsel', deadline: '2025-12-31', status: 'In Progress' },
             { id: '2', category: 'General', action: '合规团队能力提升培训', owner: '合规总监', deadline: '2025-05-20', status: 'Pending' },
        ];
    }

    return [
      { id: '1', category: 'HighPotential', action: `启动“${deptName}未来领袖”加速营`, owner: '部门负责人', deadline: '2025-Q2', status: 'In Progress' },
      { id: '2', category: 'Succession', action: '为关键岗位指定2名继任者并开始轮岗', owner: '部门负责人', deadline: '2025-06-30', status: 'Pending' },
      { id: '3', category: 'Underperformer', action: '执行PIP计划 (针对绩效评级1人员)', owner: 'Team Lead', deadline: '2025-03-31', status: 'Pending' },
    ];
  };

  const [items, setItems] = useState<ActionItem[]>(getInitialItems(getContextTitle()));

  const reportRef = useRef<HTMLDivElement>(null);

  // Sync state if context changes (e.g. switching department filter in top bar)
  useEffect(() => {
    const newTitle = getContextTitle();
    setDepartment(newTitle);
    setItems(getInitialItems(newTitle === '全公司' ? '集团' : newTitle));
  }, [currentUser, selectedDept]);

  const addItem = () => {
    const newItem: ActionItem = {
      id: Date.now().toString(),
      category: 'General',
      action: '新行动项...',
      owner: '待定',
      deadline: '2025-12-31',
      status: 'Pending'
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ActionItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`人才发展行动计划_${department}.pdf`);
    } catch (e) {
      alert("导出 PDF 失败");
    }
  };

  const exportWord = () => {
    // Generate simple HTML for Word
    const tableRows = items.map(item => `
      <tr>
        <td style="border:1px solid #000; padding: 5px;">${item.category}</td>
        <td style="border:1px solid #000; padding: 5px;">${item.action}</td>
        <td style="border:1px solid #000; padding: 5px;">${item.owner}</td>
        <td style="border:1px solid #000; padding: 5px;">${item.deadline}</td>
        <td style="border:1px solid #000; padding: 5px;">${item.status}</td>
      </tr>
    `).join('');

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${department}行动计划</title></head>
      <body>
        <h1>${department} - 2025年度人才发展行动计划</h1>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border:1px solid #000; padding: 8px;">类别</th>
              <th style="border:1px solid #000; padding: 8px;">行动举措</th>
              <th style="border:1px solid #000; padding: 8px;">负责人</th>
              <th style="border:1px solid #000; padding: 8px;">截止时间</th>
              <th style="border:1px solid #000; padding: 8px;">状态</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `行动计划_${department}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
       <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-600" /> 行动计划 (Action Plan)
            </h2>
            <p className="text-slate-500 mt-1">制定并跟踪部门级人才发展关键举措。</p>
         </div>
         <div className="flex gap-2">
            <button onClick={exportWord} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-blue-700 rounded-lg hover:bg-slate-50 font-medium">
               <FileText size={16} /> 导出 Word
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-red-700 rounded-lg hover:bg-slate-50 font-medium">
               <FileDown size={16} /> 导出 PDF
            </button>
         </div>
       </div>

       {/* Editable Container */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[600px]" ref={reportRef}>
          <div className="mb-8 pb-6 border-b border-slate-100 relative">
             <input 
               value={department}
               onChange={(e) => setDepartment(e.target.value)}
               readOnly={isManager} // Managers cannot change the department name here
               className={`text-3xl font-bold text-slate-900 w-full border-none focus:ring-0 px-0 ${isManager ? 'cursor-default focus:border-none' : 'focus:border-b focus:border-blue-500'}`}
               placeholder="输入部门名称..."
             />
             {isManager && (
                <div className="absolute right-0 top-2 flex items-center gap-1 text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded">
                   <Lock size={12} />
                   <span>已锁定 (管理者视图)</span>
                </div>
             )}
             <div className="text-slate-400 mt-2">2025年度人才盘点后续落地计划</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm font-semibold text-slate-500 border-b border-slate-200">
                  <th className="py-3 w-32">分类</th>
                  <th className="py-3">关键行动举措</th>
                  <th className="py-3 w-32">负责人</th>
                  <th className="py-3 w-32">截止时间</th>
                  <th className="py-3 w-32">状态</th>
                  <th className="py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-50">
                    <td className="py-2 pr-2">
                      <select 
                        value={item.category}
                        onChange={(e) => updateItem(item.id, 'category', e.target.value as any)}
                        className="w-full text-xs font-medium bg-slate-100 border-none rounded py-1 px-2 text-slate-700"
                      >
                        <option value="HighPotential">高潜培养</option>
                        <option value="Underperformer">绩效改进</option>
                        <option value="Succession">继任计划</option>
                        <option value="General">通用</option>
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input 
                        value={item.action}
                        onChange={(e) => updateItem(item.id, 'action', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-800 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input 
                        value={item.owner}
                        onChange={(e) => updateItem(item.id, 'owner', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-600 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input 
                        type="date"
                        value={item.deadline}
                        onChange={(e) => updateItem(item.id, 'deadline', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-600 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <select 
                        value={item.status}
                        onChange={(e) => updateItem(item.id, 'status', e.target.value as any)}
                        className={`w-full text-xs font-medium border-none rounded py-1 px-2 ${
                           item.status === 'Done' ? 'bg-green-100 text-green-700' :
                           item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                           'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <option value="Pending">待开始</option>
                        <option value="In Progress">进行中</option>
                        <option value="Done">已完成</option>
                      </select>
                    </td>
                    <td className="py-2 text-right">
                       <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button 
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} /> 添加行动项
            </button>
          </div>
       </div>
    </div>
  );
};
