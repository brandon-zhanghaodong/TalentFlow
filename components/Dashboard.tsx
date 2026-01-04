
import React, { useRef, useState } from 'react';
import { Employee, PotentialLevel, PerformanceLevel, User } from '../types';
import { BarChart3, AlertCircle, Crown, BrainCircuit, FileUp, Download, Image as ImageIcon, Filter, Edit2, FileText, HelpCircle, X, File, FileDown, Lock } from 'lucide-react';
import { generateTeamInsights, generateExecutiveReport } from '../services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  employees: Employee[]; // This is the FILTERED list based on App state
  departments: string[]; // List of all available departments
  selectedDept: string;
  onFilterChange: (dept: string) => void;
  onImport: (data: Employee[]) => void;
  title: string;
  onTitleChange: (newTitle: string) => void;
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  employees, 
  departments, 
  selectedDept, 
  onFilterChange, 
  onImport,
  title,
  onTitleChange,
  currentUser
}) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const total = employees.length;
  const highPotentials = employees.filter(e => e.potential === PotentialLevel.High).length;
  const flightRisks = employees.filter(e => e.flightRisk === 'High').length;

  const isManager = currentUser.role === 'MANAGER';

  const handleTeamAnalysis = async () => {
    setLoading(true);
    const text = await generateTeamInsights(employees);
    setInsight(text);
    setLoading(false);
  }

  const handleGenerateReport = async () => {
    setReportLoading(true);
    const deptName = isManager ? currentUser.department! : (selectedDept === 'All' ? '全公司' : selectedDept);
    const text = await generateExecutiveReport(employees, deptName);
    setReportContent(text);
    setReportLoading(false);
    setShowReportModal(true);
  };

  const handleExportReportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`人才盘点总结报告_${selectedDept}.pdf`);
    } catch (e) {
      alert("导出 PDF 失败，请重试。");
    }
  };

  const handleExportReportWord = () => {
    if (!reportRef.current) return;
    
    // We get the inner HTML, but for better Word compatibility we might want to wrap it
    const contentHtml = reportRef.current.innerHTML;
    
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + contentHtml + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `人才盘点总结报告_${selectedDept}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReportMD = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `人才盘点总结报告_${selectedDept}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
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
    if (!element) {
        alert("请先进入“人才九宫格”视图，然后再进行快照导出。");
        return;
    }
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
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
    <div className="bg-white border-b border-slate-200 px-8 py-5 relative">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        <div className="flex flex-col gap-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
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
            
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="text-slate-400 hover:text-blue-600 transition-colors ml-2"
              title="操作指引"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">部门筛选:</span>
            <div className="relative">
              <select 
                value={selectedDept}
                onChange={(e) => onFilterChange(e.target.value)}
                disabled={isManager} // Managers cannot change department
                className={`appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-1 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${isManager ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
              >
                {/* Managers only see their department option */}
                {!isManager && <option value="All">所有部门 (All)</option>}
                {departments.map(d => (
                   // If manager, only render their own dept
                   (!isManager || d === currentUser.department) && (
                      <option key={d} value={d}>{d}</option>
                   )
                ))}
              </select>
              {isManager ? (
                 <Lock className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
              ) : (
                 <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
              )}
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
               
               {/* Only HR can import usually, but for demo maybe keep it or restrict */}
               {!isManager && (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
                   title="导入 CSV (仅管理员)"
                 >
                   <FileUp size={16} />
                   <span className="text-xs font-medium hidden lg:inline">导入</span>
                 </button>
               )}

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
                 title="生成盘点报告"
               >
                 {reportLoading ? <span className="animate-spin text-xs">...</span> : <FileText size={16} />}
                 <span className="text-xs font-medium hidden lg:inline">
                    {reportLoading ? '生成中' : '生成报告'}
                 </span>
               </button>
            </div>
        </div>
      </div>

      {/* Guide Panel */}
      {showGuide && (
        <div className="absolute top-20 left-8 z-20 w-96 bg-white rounded-xl shadow-xl border border-blue-100 p-5 animate-in slide-in-from-top-4 fade-in">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="text-blue-500" size={18}/> 快速操作指引
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
           </div>
           <div className="space-y-4">
              <GuideStep num="1" title="盘点准备" text="在“员工花名册”中核对信息，或通过“导入”功能批量上传 CSV 数据。" />
              <GuideStep num="2" title="人才校准" text="进入“人才九宫格”，拖拽员工卡片调整其绩效与潜力落位。点击卡片查看 AI 诊断。" />
              <GuideStep num="3" title="继任规划" text="查看“继任者地图”，为关键岗位指定 Ready-Now 接班人。" />
              <GuideStep num="4" title="结果输出" text="点击“生成报告”，导出 Word/PDF 格式的年度盘点总结。" />
           </div>
           <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
              遇到问题？请随时向 AI 助手提问。
           </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <BrainCircuit className="text-purple-600" /> 年度盘点总结报告预览
               </h3>
               <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               <div ref={reportRef} className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200 min-h-full markdown-body">
                 <ReactMarkdown>{reportContent}</ReactMarkdown>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl">
               <button 
                 onClick={handleExportReportMD}
                 className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
               >
                 <FileDown size={18} /> Markdown
               </button>
               <button 
                 onClick={handleExportReportWord}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 hover:bg-blue-100 font-medium"
               >
                 <FileText size={18} /> 导出 Word
               </button>
               <button 
                 onClick={handleExportReportPDF}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-white hover:bg-slate-800 font-medium shadow-md"
               >
                 <File size={18} /> 导出 PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Org Analysis Banner - Only show if insight is requested */}
      {insight && (
        <div className="mt-6 flex items-start gap-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={100} />
          </div>
          
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <BrainCircuit size={24} className="text-purple-300" />
          </div>
          
          <div className="flex-1 z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-purple-100">AI 组织诊断 ({selectedDept === 'All' ? '全员' : selectedDept})</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              {insight}
            </p>
          </div>
        </div>
      )}

       {/* Analysis Trigger (When not showing insight) */}
       {!insight && (
          <div className="mt-6 text-center">
             <button 
                onClick={handleTeamAnalysis}
                disabled={loading}
                className="text-xs text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors"
             >
                <BrainCircuit size={14} /> 
                {loading ? 'AI 正在分析组织数据...' : '点击进行 AI 组织健康度分析'}
             </button>
          </div>
       )}

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

const GuideStep = ({ num, title, text }: { num: string, title: string, text: string }) => (
  <div className="flex gap-3">
    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
      {num}
    </div>
    <div>
      <div className="text-sm font-bold text-slate-800">{title}</div>
      <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</div>
    </div>
  </div>
);
