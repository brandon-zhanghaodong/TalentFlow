import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, View } from '../types';
import { Send, Bot, LayoutGrid, FileText, PieChart, Sparkles, Edit2, MessageSquare, Info, ShieldAlert, Lock, Network, Zap, ChevronRight, Activity, Users, RefreshCcw, Command, Lightbulb } from 'lucide-react';
import { chatWithTalentBot } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface HomeChatProps {
  employees: Employee[];
  title: string;
  onTitleChange: (newTitle: string) => void;
  onNavigate: (view: View) => void;
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
    className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex flex-col gap-3 relative overflow-hidden"
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
    
    <div>
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

export const HomeChat: React.FC<HomeChatProps> = ({ employees, title, onTitleChange, onNavigate }) => {
  // Determine if this is a filtered view
  const departments = Array.from(new Set(employees.map(e => e.department)));
  const isFiltered = departments.length === 1;
  const contextName = isFiltered ? departments[0] : "全公司";

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

  // Generate dynamic questions based on the *actual* context (Department vs All)
  const dynamicQuestions = useMemo(() => {
    const questions: string[] = [];
    
    if (employees.length === 0) return ["如何导入员工数据？"];

    // 1. Context-specific questions
    if (isFiltered) {
        // Specific Department View
        questions.push(`分析${contextName}的人才梯队健康度`);
        questions.push(`列出${contextName}的高离职风险人员`);
        questions.push(`${contextName}的平均司龄是多少？`);
        
        // Find a random employee for concrete examples
        const randomEmp = employees[Math.floor(Math.random() * employees.length)];
        if (randomEmp) {
            questions.push(`如何保留核心员工 ${randomEmp.name}？`);
            questions.push(`为 ${randomEmp.name} 生成一份发展建议`);
        }
    } else {
        // All Company View (Admin)
        questions.push("对比各部门的高潜人才占比");
        questions.push("哪个部门的离职风险最高？");
        questions.push("生成全公司的继任计划覆盖率分析");
        questions.push("分析一下整体的司龄分布情况");
        questions.push("列出所有 Ready-Now 状态的继任者");
    }

    // 2. Add some generic but smart analytical questions
    if (employees.length > 5) {
        questions.push("找出所有的“超级明星”并分析共同点");
    }

    // Limit to 6 items
    return questions.slice(0, 6);
  }, [employees, isFiltered, contextName]);

  const handleSend = async (textArg?: string) => {
    const text = textArg || input;
    if (!text.trim()) return;
    
    // Add User Message
    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Pass the contextName to the service so it knows what "Team" means
      const response = await chatWithTalentBot(text, employees, contextName);
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
      
      {/* Main Dialog Window */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col h-full max-h-[90vh] relative">
        
        {/* Header */}
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
                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {isFiltered ? (
                        <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                           <Lock size={10} /> {contextName}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                           <Users size={10} /> 全公司
                        </span>
                    )}
                    <span>•</span>
                    <span>{employees.length} 位员工</span>
                 </div>
              </div>
           </div>

           {hasStarted && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                 <RefreshCcw size={14} /> 重新开始
              </button>
           )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 scroll-smooth relative" ref={scrollRef}>
           
           {/* INITIAL STATE: Menu Grid */}
           {!hasStarted && (
              <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                 
                 <div className="text-center mb-10 mt-4">
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">
                       Hello, How can I help today?
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-sm">
                       我是您的智能人才助手。您可以点击下方卡片快速导航，或直接输入问题进行对话。
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {/* Navigation Actions */}
                    <MenuCard 
                       icon={<LayoutGrid />} 
                       title="人才九宫格" 
                       desc="进入九宫格视图进行人才校准与评估"
                       onClick={() => onNavigate('grid')}
                    />
                    <MenuCard 
                       icon={<Network />} 
                       title="继任者地图" 
                       desc="查看关键岗位的板凳深度与继任计划"
                       onClick={() => onNavigate('succession')}
                    />
                    <MenuCard 
                       icon={<FileText />} 
                       title="行动计划" 
                       desc="制定并跟踪部门级人才发展举措"
                       onClick={() => onNavigate('plan')}
                    />
                    
                    {/* AI Commands */}
                    <MenuCard 
                       icon={<Activity />} 
                       title="组织健康度诊断" 
                       desc="AI 分析当前团队的人才结构与梯队健康度"
                       onClick={() => handleSend(`请分析${contextName}的人才结构与健康度，并给出关键发现。`)}
                       isCommand
                    />
                    <MenuCard 
                       icon={<ShieldAlert />} 
                       title="流失风险预警" 
                       desc="识别高绩效但高离职风险的关键人才"
                       onClick={() => handleSend(`请列出${contextName}所有高绩效但具有高离职风险的员工，并给出保留建议。`)}
                       isCommand
                    />
                    <MenuCard 
                       icon={<Sparkles />} 
                       title="高潜人才挖掘" 
                       desc="快速筛选并分析组织内的明日之星"
                       onClick={() => handleSend("谁是目前的高潜人才(High Potential)？请简要介绍他们。")}
                       isCommand
                    />
                 </div>

                 {/* Dynamic Suggested Questions based on Context */}
                 <div className="border-t border-slate-200 pt-8">
                    <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                       <Lightbulb size={16} className="text-yellow-500" /> 
                       {isFiltered ? `针对 ${contextName} 的提问` : '全公司分析提问'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {dynamicQuestions.map((q, idx) => (
                           <QuickPrompt key={idx} text={q} onClick={() => handleSend(q)} />
                       ))}
                    </div>
                 </div>
              </div>
           )}

           {/* CHAT STATE: Messages */}
           {hasStarted && (
              <div className="max-w-3xl mx-auto p-6 space-y-6 min-h-full">
                 {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         {m.role === 'assistant' && (
                           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                             <Sparkles size={14} className="text-indigo-600" />
                           </div>
                         )}
                         {m.role === 'user' && (
                           <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                             <Users size={14} className="text-white" />
                           </div>
                         )}
                         
                         <div className={`rounded-2xl px-5 py-3.5 text-sm leading-7 shadow-sm ${
                            m.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none markdown-body'
                          }`}>
                            {m.role === 'assistant' ? (
                               <ReactMarkdown>{m.content}</ReactMarkdown>
                            ) : m.content}
                         </div>
                      </div>
                    </div>
                 ))}
                 
                 {loading && (
                    <div className="flex justify-start">
                       <div className="flex gap-3 max-w-[75%]">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                             <Sparkles size={14} className="text-indigo-600" />
                           </div>
                           <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center shadow-sm">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                           </div>
                       </div>
                    </div>
                 )}
                 <div className="h-4"></div> {/* Spacer */}
              </div>
           )}
        </div>

        {/* Footer Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
           <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={hasStarted ? "回复..." : "输入指令或提问..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm md:text-base shadow-inner"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
              {!hasStarted && (
                 <div className="text-center mt-3 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Command size={10} /> 
                    <span>AI 模型可基于当前数据上下文 ({contextName}) 回答人才相关问题</span>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
