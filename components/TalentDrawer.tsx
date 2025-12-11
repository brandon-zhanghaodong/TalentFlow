
import React, { useState, useEffect } from 'react';
import { Employee, PerformanceLevel, PotentialLevel } from '../types';
import { X, Sparkles, TrendingUp, CheckCircle, BrainCircuit, UserPlus, FileText, Target, Flag } from 'lucide-react';
import { generateTalentAnalysis, generateSuccessionPlan } from '../services/geminiService';

interface TalentDrawerProps {
  employee: Employee | null;
  onClose: () => void;
}

export const TalentDrawer: React.FC<TalentDrawerProps> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'succession'>('profile');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [successionPlan, setSuccessionPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when employee changes
  useEffect(() => {
    setAnalysis(null);
    setSuccessionPlan(null);
    setLoading(false);
    setActiveTab('profile');
  }, [employee]);

  if (!employee) return null;

  const isSuperStar = employee.performance === PerformanceLevel.High && employee.potential === PotentialLevel.High;

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await generateTalentAnalysis(employee);
    setAnalysis(result);
    setLoading(false);
  };

  const handleGenerateSuccession = async () => {
    setLoading(true);
    const result = await generateSuccessionPlan(employee);
    setSuccessionPlan(result);
    setLoading(false);
  };

  const riskLabel = {
    'Low': '低',
    'Medium': '中',
    'High': '高'
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
        <div className="flex items-center gap-4">
          <img src={employee.avatar} alt={employee.name} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">{employee.name}</h2>
            <p className="text-sm text-slate-500">{employee.role}</p>
            <div className="flex gap-2 mt-1">
               <span className={`text-xs px-2 py-0.5 rounded-full ${employee.flightRisk === 'High' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                 离职风险: {riskLabel[employee.flightRisk] || employee.flightRisk}
               </span>
               {isSuperStar && (
                 <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                   高潜高绩
                 </span>
               )}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          人才画像
        </button>
        <button 
          onClick={() => setActiveTab('succession')}
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'succession' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          继任规划 {isSuperStar && <Sparkles size={12} className="inline text-yellow-500 mb-0.5"/>}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {activeTab === 'profile' ? (
          <>
            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 uppercase tracking-wide">司龄</div>
                <div className="text-lg font-semibold text-slate-800">{employee.tenure} 年</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 uppercase tracking-wide">上次评估</div>
                <div className="text-lg font-semibold text-slate-800">{new Date(employee.lastReviewDate).toLocaleDateString('zh-CN')}</div>
              </div>
            </div>

            {/* Career Aspiration (New) */}
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
               <h3 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                 <Flag size={14} /> 职业抱负 (Career Aspiration)
               </h3>
               <p className="text-sm text-slate-700 italic">
                 {employee.careerAspiration || "暂无记录"}
               </p>
            </div>

            {/* Competencies */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" /> 核心优势
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.keyStrengths.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" /> 待发展项
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.developmentNeeds.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Diagnosis Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit size={16} className="text-purple-600" /> 
                  Gemini 智能诊断
                </h3>
                {!analysis && (
                    <button 
                      onClick={handleGenerateInsight}
                      disabled={loading}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {loading ? '分析中...' : '生成诊断'}
                      {!loading && <Sparkles size={12} />}
                    </button>
                )}
              </div>

              {loading && !analysis && !successionPlan && (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              )}

              {analysis && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Succession Plan Tab Content */
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             
             {/* Succession Details (New) */}
             <div className="space-y-4">
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                    目标岗位 (Target Role)
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                    <Target size={16} className="text-slate-400"/>
                    <span className="text-sm text-slate-800">{employee.targetRole || "未指定"}</span>
                  </div>
               </div>
               
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                    继任准备度 (Readiness)
                  </label>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1.5 rounded text-xs font-medium border ${employee.successionStatus === 'Ready-Now' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Ready-Now (即任)
                    </span>
                    <span className={`px-3 py-1.5 rounded text-xs font-medium border ${employee.successionStatus === 'Ready-Future' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      Ready-Future (1-2年)
                    </span>
                  </div>
               </div>
             </div>

             {isSuperStar && (
               <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                 <h3 className="text-yellow-800 font-bold flex items-center gap-2 mb-2">
                   <UserPlus size={18} /> 高潜人才继任建议
                 </h3>
                 <p className="text-xs text-yellow-700 leading-relaxed">
                   该员工为 Super Star，建议利用 AI 生成详细的晋升路径规划。
                 </p>
               </div>
             )}

             <div className="pt-2 border-t border-slate-100">
               <div className="flex justify-between items-center mb-4 mt-4">
                 <h3 className="text-sm font-bold text-slate-900">AI 继任发展建议</h3>
                  {!successionPlan && isSuperStar && (
                    <button 
                      onClick={handleGenerateSuccession}
                      disabled={loading}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {loading ? '生成中...' : '生成计划'}
                      {!loading && <FileText size={12} />}
                    </button>
                  )}
               </div>
               
               {loading && !successionPlan && (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                )}

               {successionPlan ? (
                 <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap shadow-sm">
                   {successionPlan}
                 </div>
               ) : (
                 !isSuperStar ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                       仅针对“超级明星”员工提供 AI 继任规划功能。
                    </div>
                 ) : (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                      点击上方按钮生成继任路径建议
                    </div>
                 )
               )}
             </div>
          </div>
        )}

      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
        <button className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
          查看档案
        </button>
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200">
          保存更改
        </button>
      </div>
    </div>
  );
};
