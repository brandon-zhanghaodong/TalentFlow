import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, View, PerformanceLevel, PotentialLevel, User } from '../types';
import { Send, Bot, LayoutGrid, FileText, PieChart, Sparkles, Edit2, MessageSquare, Info, ShieldAlert, Lock, Network, Zap, ChevronRight, Activity, Users, RefreshCcw, Command, Lightbulb } from 'lucide-react';
import { chatWithTalentBot } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface HomeChatProps {
  employees: Employee[];
  title: string;
  onTitleChange: (newTitle: string) => void;
  onNavigate: (view: View) => void;
  currentUser: User;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  isCommand?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({ icon, title, desc, onClick, isCommand = false }) => (
  <button 
    onClick={onClick}
    className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col gap-3 relative overflow-hidden h-full"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity`}>
       {icon}
    </div>
    <div className="flex items-center justify-between w-full">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCommand ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      {isCommand && <Sparkles size={14} className="text-indigo-400 opacity-50" />}
    </div>
    
    <div className="flex-1">
      <div className="font-bold text-slate-800 text-sm">{title}</div>
      <div className="text-xs text-slate-500 mt-1 leading-snug">{desc}</div>
    </div>

    <div className="mt-2 flex items-center text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
       {isCommand ? 'Ask AI' : 'Open View'} <ChevronRight size={12} className="ml-1" />
    </div>
  </button>
);

interface QuickPromptProps {
  text: string;
  onClick: () => void;
}

const QuickPrompt: React.FC<QuickPromptProps> = ({ text, onClick }) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs md:text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm whitespace-nowrap"
  >
    {text}
  </button>
);

export const HomeChat: React.FC<HomeChatProps> = ({ employees, title, onTitleChange, onNavigate, currentUser }) => {
  
  const isManager = currentUser.role === 'MANAGER';
  
  // Calculate context based on Role first (Stronger constraint), then Data
  // This fixes the issue where an empty employee list for a Manager resulted in "全公司" (Whole Company) context
  const uniqueDepts = Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[];
  
  let contextName = "全公司";
  let isFiltered = false;

  if (isManager) {
     // Manager always sees their department context, even if data is empty
     contextName = currentUser.department || "我的部门";
     isFiltered = true;
  } else {
     // HR sees context based on what they filtered (reflected in employees array)
     if (uniqueDepts.length === 1 && uniqueDepts[0]) {
        contextName = uniqueDepts[0];
        isFiltered = true;
     } else {
        contextName = "全公司";
        isFiltered = false;
     }
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasStarted = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const dynamicQuestions = useMemo(() => {
    const questions: string[] = [];
    
    // Determine the context department name strictly
    const dept = contextName;
    const isSales = dept.includes('销售') || dept.includes('Sales') || dept.includes('业务');
    const isTech = dept.includes('研发') || dept.includes('技术') || dept.includes('R&D');
    const isHRDept = dept.includes('HR') || dept.includes('人力') || dept.includes('人事');

    if (isFiltered) {
        // --- 1. Department-Specific Strategic Questions ---
        if (isSales) {
            questions.push(`诊断${dept}的业绩与人才匹配度`); 
            questions.push(`分析${dept}销冠人员的流失风险`);
            questions.push(`如何优化${dept}的销售激励与晋升机制？`);
        } 
        else if (isTech) {
            questions.push(`评估${dept}关键技术专家的稳定性`);
            questions.push(`技术团队的人才梯队是否存在断层？`);
            questions.push(`如何为${dept}的高潜工程师制定技术专家路线？`);
        } 
        else if (isHRDept) {
            // FIX: If user is Manager of HR Dept, show Dept-specific questions.
            // If user is HR Admin (filtering for HR dept or global), show global strategic questions.
            if (isManager) {
                questions.push(`诊断${dept}内部的人才梯队健康度`);
                questions.push(`分析${dept}团队的流失风险`);
                questions.push(`为${dept}的关键岗位制定继任计划`);
            } else {
                questions.push(`全公司各部门继任计划完成度分析`);
                questions.push(`分析本年度关键人才流失的主要原因`);
                questions.push(`制定全公司的高潜人才保留策略`);
            }
        } 
        else {
            // Generic Manager Questions
            questions.push(`诊断${dept}的人才梯队健康度`); 
            questions.push(`分析${dept}团队目前的稳定性`);
            questions.push(`为${dept}的关键岗位制定继任计划`);
        }

        // --- 2. Data-Driven Insights (Only if data exists) ---
        if (employees.length > 0) {
            const highRisk = employees.filter(e => e.flightRisk === 'High');
            if (highRisk.length > 0) {
              questions.push(`列出${dept}的 ${highRisk.length} 位高风险员工并给出保留方案`);
            }
            
            const star = employees.find(e => e.performance === PerformanceLevel.High && e.potential === PotentialLevel.High);
            if (star) {
              questions.push(`为超级明星 ${star.name} 制定挑战性发展计划`);
            }
            
            const lowPerf = employees.find(e => e.performance === PerformanceLevel.Low);
            if (lowPerf) {
                 questions.push(`针对 ${lowPerf.name} 制定PIP改进计划`);
            }
        }
        
        // --- 3. Operational Tasks ---
        questions.push(`起草一份${dept}盘点汇报邮件`);

    } else {
        // --- HR Admin / Global View ---
        questions.push("生成全公司人才盘点总结摘要");
        questions.push("对比各部门的高潜人才占比");
        questions.push("列出全公司所有高风险关键人才");
        questions.push("分析全公司的继任计划覆盖率");
        questions.push("找出全公司所有的“超级明星”并分析共同点");
        questions.push("基于当前数据，给CEO提三条组织发展建议");
    }

    // Ensure we always have enough questions
    if (questions.length < 4) {
       questions.push(`如何提升${contextName}的人才密度？`);
       questions.push(`分析${contextName}的司龄结构风险`);
    }

    // Deduplicate and slice
    return Array.from(new Set(questions)).slice(0, 6);
  }, [employees, isFiltered, contextName, isManager]);

  const handleSend = async (textArg?: string) => {
    const text: string = textArg || input;
    if (!text || !text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithTalentBot(text, employees, contextName, currentUser.role);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: "抱歉，我遇到了一点问题，请稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="h-full w-full bg-slate-100/50 flex items-center justify-center p-4 md:p-6 font-sans">
      
      {/* Increased width from max-w-5xl to max-w-7xl for better large screen experience */}
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col h-full max-h-[90vh] relative">
        
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10 shrink-0">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Bot size={20} />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                    {isEditingTitle ? (
                      <input
                          type="text"
                          value={title}
                          onChange={(e) => onTitleChange(e.target.value)}
                          onBlur={() => setIsEditingTitle(false)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                          className="font-bold text-slate-900 border-b border-blue-500 focus:outline-none bg-transparent py-0.5"
                          autoFocus
                      />
                    ) : (
                      <h2 
                        className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        {title}
                      </h2>
                    )}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {isFiltered ? <Lock size={12} /> : <Network size={12} />}
                    <span>{contextName}</span>
                 </div>
              </div>
           </div>
           
           <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Start New Chat">
              <RefreshCcw size={18} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
           {!hasStarted ? (
              // Increased width for welcome screen to max-w-4xl
              <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                 <div className="mb-8 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                       Hi, I'm Talent Bot.
                    </h3>
                    <p className="text-slate-500">
                       您的 {contextName} 专属人才盘点助手。请选择快捷指令或直接提问。
                    </p>
                 </div>

                 {/* Updated grid to 4 columns on large screens */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
                    <MenuCard 
                      icon={<LayoutGrid size={24} />}
                      title="人才九宫格"
                      desc="进入校准视图，拖拽调整人才落位。"
                      onClick={() => onNavigate('grid')}
                    />
                    <MenuCard 
                      icon={<Users size={24} />}
                      title="继任者地图"
                      desc="查看关键岗位继任梯队与风险。"
                      onClick={() => onNavigate('succession')}
                    />
                    <MenuCard 
                      icon={<PieChart size={24} />}
                      title="效能仪表盘"
                      desc="分析司龄、流失率与人才密度。"
                      onClick={() => onNavigate('analytics')}
                    />
                    <MenuCard 
                      icon={<FileText size={24} />}
                      title="生成总结报告"
                      desc="一键生成当前范围的人才盘点报告。"
                      onClick={() => handleSend("生成人才盘点总结报告")}
                      isCommand
                    />
                 </div>

                 <div className="w-full">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <Lightbulb size={12} /> 猜你想问 (Suggested)
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                       {dynamicQuestions.map((q, i) => (
                          <QuickPrompt key={i} text={q} onClick={() => handleSend(q)} />
                       ))}
                    </div>
                 </div>
              </div>
           ) : (
             // Increased message container width to max-w-4xl
             <div className="space-y-6 max-w-4xl mx-auto">
               {messages.map((msg, idx) => (
                 <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                    {msg.role === 'assistant' && (
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                          <Bot size={16} />
                       </div>
                    )}
                    
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none markdown-body'
                    }`}>
                       {msg.role === 'assistant' ? (
                         <ReactMarkdown>{msg.content}</ReactMarkdown>
                       ) : (
                         msg.content
                       )}
                    </div>

                    {msg.role === 'user' && (
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                          <span className="font-bold text-xs">Me</span>
                       </div>
                    )}
                 </div>
               ))}
               
               {loading && (
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                       <Bot size={16} />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                 </div>
               )}
             </div>
           )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 z-10">
           {/* Increased input area width to max-w-4xl */}
           <div className="max-w-4xl mx-auto relative">
              <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                 placeholder="输入您的问题或指令..."
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                 disabled={loading}
              />
              <button 
                 onClick={() => handleSend()}
                 disabled={!input.trim() || loading}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-sm"
              >
                 <Send size={16} />
              </button>
           </div>
           <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                 <ShieldAlert size={10} /> 
                 AI生成内容仅供参考，决策请以实际情况为准。
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};