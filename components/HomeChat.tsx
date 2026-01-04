
import React, { useState, useRef, useEffect } from 'react';
import { Employee, View } from '../types';
import { Send, Bot, LayoutGrid, FileText, PieChart, Sparkles, Edit2, MessageSquare, Info, ShieldAlert, Lock } from 'lucide-react';
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

export const HomeChat: React.FC<HomeChatProps> = ({ employees, title, onTitleChange, onNavigate }) => {
  // Determine if this is a filtered view
  const departments = Array.from(new Set(employees.map(e => e.department)));
  const isFiltered = departments.length === 1;
  const contextName = isFiltered ? departments[0] : "全公司";

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `你好！我是 TalentFlow AI 助手。\n\n当前数据范围：**${contextName}** (${employees.length} 人)。\n\n你可以问我：\n- "本部门有多少高潜人才？"\n- "谁的离职风险较高？"\n- "为张三生成一份发展建议"` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when context changes significantly
  useEffect(() => {
     setMessages([
        { role: 'assistant', content: `你好！我是 TalentFlow AI 助手。\n\n当前数据范围：**${contextName}** (${employees.length} 人)。\n\n你可以问我：\n- "本部门有多少高潜人才？"\n- "谁的离职风险较高？"\n- "为张三生成一份发展建议"` }
     ]);
  }, [employees.length, contextName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chatWithTalentBot(userMsg, employees);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "抱歉，我遇到了一点问题，请稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  };

  const QuickAction = ({ icon, label, sub, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left flex items-center gap-4 group relative overflow-hidden"
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className="font-bold text-slate-800 text-sm md:text-base">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full">
      {/* Header */}
      <div className="px-8 py-6 pb-4 shrink-0">
         <div className="w-full">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <Bot size={24} className="text-white" />
             </div>
             {isEditingTitle ? (
               <input
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
                  className="text-2xl md:text-3xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent py-1 w-full max-w-2xl"
                  autoFocus
               />
             ) : (
               <div 
                 className="flex items-center gap-3 group cursor-pointer"
                 onClick={() => setIsEditingTitle(true)}
                 title="点击编辑标题"
               >
                 <h1 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                   {title}
                 </h1>
                 <Edit2 size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             )}
           </div>
           <p className="text-slate-500 ml-1 flex items-center gap-2">
             {isFiltered ? (
                 <span className="flex items-center gap-1 text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-medium">
                    <Lock size={10} /> 仅限部门: {contextName}
                 </span>
             ) : (
                 <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-medium">
                    全公司视图
                 </span>
             )}
             <span className="text-sm">已加载 <span className="font-bold text-slate-900">{employees.length}</span> 条员工数据</span>
           </p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col w-full px-8 pb-8 gap-6">
        
        {/* Helper Tip */}
        {showTip && (
           <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between animate-in fade-in shrink-0">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                 <Info size={16} />
                 <span><strong>AI 数据隐私提示：</strong> 您的对话仅基于当前权限范围内的员工数据 ({contextName})。</span>
              </div>
              <button onClick={() => setShowTip(false)} className="text-blue-400 hover:text-blue-600">
                <span className="text-xs">关闭</span>
              </button>
           </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <QuickAction 
            icon={<LayoutGrid size={24} />} 
            label="1. 人才九宫格" 
            sub="拖拽校准与评估" 
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            onClick={() => onNavigate('grid')}
          />
          <QuickAction 
            icon={<FileText size={24} />} 
            label="2. 制定行动计划" 
            sub="部门发展与跟进" 
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            onClick={() => onNavigate('plan')}
          />
          <QuickAction 
            icon={<PieChart size={24} />} 
            label="3. 数据洞察报告" 
            sub="查看仪表盘分析" 
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            onClick={() => onNavigate('analytics')}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <MessageSquare size={18} className="text-blue-500" />
               <span className="text-sm font-semibold text-slate-700">AI 智能对话 (Gemini 2.5)</span>
            </div>
            {isFiltered && (
               <div className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldAlert size={12} /> 数据隔离保护中
               </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                   {m.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                       <Sparkles size={14} className="text-indigo-600" />
                     </div>
                   )}
                   {m.role === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                       <UserIcon />
                     </div>
                   )}
                   
                   <div className={`rounded-2xl px-5 py-3.5 text-sm leading-7 shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none markdown-body'
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
                     <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                     </div>
                 </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
             <div className="flex gap-3 relative max-w-5xl mx-auto w-full">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isFiltered ? `询问关于 ${contextName} 的人才情况...` : "输入指令..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner text-sm md:text-base"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-medium shadow-md shadow-blue-200 flex items-center gap-2"
                >
                  <span>发送</span>
                  <Send size={18} />
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
