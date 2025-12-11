
import React, { useState, useRef } from 'react';
import { Employee, PotentialLevel, PerformanceLevel } from '../types';
import { BarChart3, AlertCircle, Crown, BrainCircuit, Upload, FileUp, Download, Image as ImageIcon, Filter, Edit2, FileText } from 'lucide-react';
import { generateTeamInsights, generateExecutiveReport } from '../services/geminiService';
import html2canvas from 'html2canvas';

interface DashboardProps {
  employees: Employee[]; // This is the FILTERED list
  departments: string[]; // List of all available departments
  selectedDept: string;
  onFilterChange: (dept: string) => void;
  onImport: (data: Employee[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  employees, 
  departments, 
  selectedDept, 
  onFilterChange, 
  onImport 
}) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [title, setTitle] = useState("2025年度人才盘点");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = employees.length;
  const highPotentials = employees.filter(e => e.potential === PotentialLevel.High).length;
  const flightRisks = employees.filter(e => e.flightRisk === 'High').length;

  const handleTeamAnalysis = async () => {
    setLoading(true);
    const text = await generateTeamInsights(employees);
    setInsight(text);
    setLoading(false);
  }

  const handleGenerateReport = async () => {
    setReportLoading(true);
    const text = await generateExecutiveReport(employees, selectedDept === 'All' ? '全公司' : selectedDept);
    
    // Download as Markdown file
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `人才盘点总结报告_${selectedDept}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setReportLoading(false);
  };

  const parseLevel = (val: string): number => {
    const v = val?.trim().toLowerCase();
    if (['2', 'high', '高'].includes(v)) return 2;
    if (['0', 'low', '低'].includes(v)) return 0;
    return 1; // Default to Medium
  };

  const parseRisk = (val: string): 'Low' | 'Medium' | 'High' => {
    const v = val?.trim().toLowerCase();
    if (['high', '高'].includes(v)) return 'High';
    if (['medium', '中'].includes(v)) return 'Medium';
    return 'Low';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const newEmployees: Employee[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length < 3) continue;

        const emp: Employee = {
          id: `imported-${Date.now()}-${i}`,
          name: cols[0]?.trim() || 'Unknown',
          role: cols[1]?.trim() || 'Staff',
          department: cols[2]?.trim() || 'General',
          performance: parseLevel(cols[3]) as PerformanceLevel,
          potential: parseLevel(cols[4]) as PotentialLevel,
          tenure: parseFloat(cols[5]) || 1,
          flightRisk: parseRisk(cols[6]),
          lastReviewDate: new Date().toISOString().split('T')[0],
          keyStrengths: cols[7] ? cols[7].split(/[|;]/).map(s => s.trim()) : [],
          developmentNeeds: cols[8] ? cols[8].split(/[|;]/).map(s => s.trim()) : [],
          avatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
          successionStatus: 'None',
          targetRole: '',
          careerAspiration: ''
        };
        newEmployees.push(emp);
      }

      if (newEmployees.length > 0) {
        onImport(newEmployees);
        alert(`成功导入 ${newEmployees.length} 位员工数据！`);
      } else {
        alert('未找到有效数据，请检查 CSV 格式。');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Export Logic ---
  const handleExportCSV = () => {
    const headers = ['姓名', '职位', '部门', '绩效等级(0低1中2高)', '潜力等级(0低1中2高)', '司龄', '离职风险', '核心优势', '待发展项', '目标岗位', '继任状态', '职业抱负'];
    const rows = employees.map(e => [
      e.name,
      e.role,
      e.department,
      e.performance, 
      e.potential,
      e.tenure,
      e.flightRisk,
      `"${e.keyStrengths.join('|')}"`, 
      `"${e.developmentNeeds.join('|')}"`,
      e.targetRole || '',
      e.successionStatus || 'None',
      `"${e.careerAspiration || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel chinese support
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `人才盘点数据_${selectedDept}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportImage = async () => {
    const element = document.getElementById('nine-box-grid-container');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true, // For avatars
        backgroundColor: '#f8fafc'
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `九宫格快照_${selectedDept}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (err) {
      console.error("Export image failed", err);
      alert("导出图片失败，请重试");
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        <div className="flex flex-col gap-1 min-w-[280px]">
          {isEditingTitle ? (
             <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                className="text-2xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent py-1"
                autoFocus
             />
          ) : (
            <div 
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
              title="点击编辑标题"
            >
              <h1 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                {title}
              </h1>
              <Edit2 size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">部门筛选:</span>
            <div className="relative">
              <select 
                value={selectedDept}
                onChange={(e) => onFilterChange(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-1 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="All">所有部门 (All)</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
            {/* Stats */}
            <StatCard 
              icon={<Crown size={18} className="text-yellow-600" />}
              label="高潜人才"
              value={highPotentials}
              subtext={`占比 ${total > 0 ? Math.round((highPotentials/total)*100) : 0}%`}
              color="bg-yellow-50 border-yellow-100"
            />
             <StatCard 
              icon={<AlertCircle size={18} className="text-red-600" />}
              label="高离职风险"
              value={flightRisks}
              subtext="需重点关注"
              color="bg-red-50 border-red-100"
            />
            <StatCard 
              icon={<BarChart3 size={18} className="text-blue-600" />}
              label="盘点人数"
              value={total}
              subtext={selectedDept === 'All' ? "全公司" : selectedDept}
              color="bg-blue-50 border-blue-100"
            />

            {/* Actions */}
            <div className="pl-2 xl:pl-4 xl:border-l border-slate-200 flex gap-2">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 onChange={handleFileUpload}
                 accept=".csv"
                 className="hidden"
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                 title="导入 CSV"
               >
                 <FileUp size={16} />
                 <span className="text-xs font-medium hidden lg:inline">导入</span>
               </button>

               <button 
                 onClick={handleExportCSV}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                 title="导出当前筛选结果 CSV"
               >
                 <Download size={16} />
                 <span className="text-xs font-medium hidden lg:inline">导出</span>
               </button>

               <button 
                 onClick={handleExportImage}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm"
                 title="导出当前九宫格图片"
               >
                 <ImageIcon size={16} />
                 <span className="text-xs font-medium hidden lg:inline">快照</span>
               </button>

               <button 
                 onClick={handleGenerateReport}
                 disabled={reportLoading}
                 className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                 title="生成年度盘点总结报告 (Markdown)"
               >
                 {reportLoading ? <span className="animate-spin text-xs">...</span> : <FileText size={16} />}
                 <span className="text-xs font-medium hidden lg:inline">
                    {reportLoading ? '生成中' : '生成报告'}
                 </span>
               </button>
            </div>
        </div>
      </div>

      {/* AI Org Analysis Banner */}
      <div className="mt-6 flex items-start gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit size={100} />
        </div>
        
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
           <BrainCircuit size={24} className="text-purple-300" />
        </div>
        
        <div className="flex-1 z-10">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-semibold text-purple-100">AI 组织诊断 ({selectedDept === 'All' ? '全员' : selectedDept})</h3>
             <button 
                onClick={handleTeamAnalysis}
                disabled={loading}
                className="text-xs bg-white text-slate-900 px-3 py-1.5 rounded font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
             >
                {loading ? '正在分析...' : '开始人才健康度分析'}
             </button>
           </div>
           
           <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
             {insight ? insight : `利用 Gemini 识别 ${selectedDept === 'All' ? '整个组织' : selectedDept} 分布中的继任断层、人才囤积或离职风险。`}
           </p>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }: any) => (
  <div className={`px-4 py-3 rounded-xl border ${color} min-w-[120px]`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
       <span className="text-2xl font-bold text-slate-800">{value}</span>
       <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{subtext}</span>
    </div>
  </div>
);
