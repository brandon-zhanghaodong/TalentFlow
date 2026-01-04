
import React, { useMemo, useRef, useState } from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';
import { Layers, AlertTriangle, Users, TrendingUp, Briefcase, Clock, FileDown, FileText, BrainCircuit, X, File } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateAnalyticsReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const AnalyticsView: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const total = employees.length;
  const reportRef = useRef<HTMLDivElement>(null);
  const textReportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
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

  // 3. Succession Coverage
  const successionStats = useMemo(() => {
    const targetRoles = new Set(employees.map(e => e.targetRole).filter(Boolean));
    const coveredRoles = new Set(employees.filter(e => e.successionStatus === 'Ready-Now').map(e => e.targetRole));
    
    const totalKeyRoles = targetRoles.size || 1; 
    const coveredCount = coveredRoles.size;
    
    return {
      rate: Math.round((coveredCount / totalKeyRoles) * 100),
      count: coveredCount,
      total: totalKeyRoles
    }
  }, [employees]);

  const handleGenerateAIReport = async () => {
    setLoading(true);
    const stats = {
       successionRate: successionStats.rate,
       successionCount: successionStats.count,
       successionTotal: successionStats.total,
       riskCount: criticalRiskEmployees.length,
       avgTenure: (employees.reduce((acc, curr) => acc + curr.tenure, 0) / (total || 1)).toFixed(1),
       tenureDist
    };
    const text = await generateAnalyticsReport(stats);
    setReportContent(text);
    setLoading(false);
    setShowModal(true);
  };

  // Export functions used INSIDE the modal
  const handleExportPDF = async () => {
    if (!textReportRef.current) return;
    try {
      const canvas = await html2canvas(textReportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AI分析报告_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      alert("导出 PDF 失败");
    }
  };

  const handleExportWord = () => {
    if (!textReportRef.current) return;
    const contentHtml = textReportRef.current.innerHTML;
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>分析报告</title></head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + contentHtml + postHtml;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI分析报告_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-slate-50">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <TrendingUp className="text-blue-600" /> 组织效能与风险分析
         </h2>
         <div className="flex gap-2">
            <button 
              onClick={handleGenerateAIReport}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
            >
               {loading ? <span className="animate-spin">...</span> : <BrainCircuit size={16} />}
               <span className="text-sm font-medium">生成与导出报告 (PDF/Word)</span>
            </button>
         </div>
      </div>
      
      <div ref={reportRef} className="bg-slate-50 p-4 rounded-xl">
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

       {/* AI Report Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <BrainCircuit className="text-purple-600" /> AI 效能分析报告预览
               </h3>
               <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={24} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               <div ref={textReportRef} className="max-w-3xl mx-auto bg-white p-8 shadow-sm border border-slate-200 min-h-full markdown-body">
                 <h1 className="text-2xl font-bold mb-4 border-b pb-2">组织效能深度分析报告</h1>
                 <ReactMarkdown>{reportContent || ''}</ReactMarkdown>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl">
               <button 
                 onClick={handleExportWord}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 hover:bg-blue-100 font-medium"
               >
                 <FileText size={18} /> 导出 Word
               </button>
               <button 
                 onClick={handleExportPDF}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg text-white hover:bg-slate-800 font-medium shadow-md"
               >
                 <File size={18} /> 导出 PDF
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
