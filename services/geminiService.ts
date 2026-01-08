
import { GoogleGenAI } from "@google/genai";
import { Employee, PerformanceLevel, PotentialLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTalentAnalysis = async (employee: Employee): Promise<string> => {
  const perfMap = {
    [PerformanceLevel.Low]: "低 (Low)",
    [PerformanceLevel.Medium]: "中 (Medium)",
    [PerformanceLevel.High]: "高 (High)",
  };
  const potMap = {
    [PotentialLevel.Low]: "低 (Low)",
    [PotentialLevel.Medium]: "中 (Medium)",
    [PotentialLevel.High]: "高 (High)",
  };

  const prompt = `
    你是一位资深的人力资源及人才管理专家 (HR Expert)。
    请针对以下员工进行人才盘点（九宫格校准）分析。

    员工档案:
    - 姓名: ${employee.name}
    - 职位: ${employee.role}
    - 司龄: ${employee.tenure} 年
    - 绩效评级: ${perfMap[employee.performance]}
    - 潜力评级: ${potMap[employee.potential]}
    - 离职风险: ${employee.flightRisk}
    - 目标岗位: ${employee.targetRole || '未定义'}
    - 职业抱负: ${employee.careerAspiration || '未记录'}
    - 核心优势: ${employee.keyStrengths.join(", ")}
    - 待发展项: ${employee.developmentNeeds.join(", ")}

    请以 Markdown 格式提供一份结构化的分析报告，包含以下内容（请使用中文回答）:
    1. **保留策略 (Retention Strategy)**: 基于该员工的风险和人才画像，我们如何保留他们？
    2. **个人发展计划 (Development Plan)**: 3个具体可执行的步骤，帮助他们晋升到下一阶段（例如：具体的培训、轮岗、挑战性任务）。
    3. **SWOT 分析**: 针对其职业发展的简要优势/劣势/机会/威胁分析。
    
    语气请保持专业、客观且具有建设性。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "暂时无法生成分析报告。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接 AI 服务出错，请检查您的 API Key。";
  }
};

export const generateSuccessionPlan = async (employee: Employee): Promise<string> => {
  const prompt = `
    你是一位顶尖的继任计划专家。
    员工 ${employee.name} 目前担任 ${employee.department} 的 ${employee.role}，在人才盘点中被评为“超级明星”（高绩效、高潜力）。
    职业抱负: ${employee.careerAspiration || '未填写'}
    
    请为该员工制定一份专属的**继任计划 (Succession Plan)**，内容包括：
    1. **潜在晋升路径**: 建议 2-3 个具体的未来岗位（垂直晋升或跨部门轮岗）。
    2. **准备度差距分析 (Gap Analysis)**: 想要胜任下一级岗位，该员工目前最缺乏的能力是什么？
    3. **12个月行动方案**: 具体的导师辅导、关键项目历练或领导力培训建议。

    请使用 Markdown 格式，用中文回答，条理清晰。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "暂时无法生成继任计划。";
  } catch (error) {
    console.error("Gemini API Succession Error:", error);
    return "生成继任计划时出错。";
  }
};

export const generateTeamInsights = async (employees: Employee[]): Promise<string> => {
  // Simple aggregation for the prompt
  const count = employees.length;
  const highPo = employees.filter(e => e.potential === PotentialLevel.High).length;
  const highPerf = employees.filter(e => e.performance === PerformanceLevel.High).length;
  const highRisk = employees.filter(e => e.flightRisk === 'High').length;
  
  const prompt = `
    你是一位组织发展专家 (OD Expert)。
    请分析当前 ${count} 位员工的人才盘点数据。
    
    数据统计:
    - 高潜力人才数: ${highPo}
    - 高绩效人才数: ${highPerf}
    - 高离职风险: ${highRisk}
    
    请提供一份简要的战略总结（200字以内，使用中文），包含:
    1. 团队人才梯队的整体健康度。
    2. 一个主要风险点（例如：继任计划断层、人才流失风险等）。
    3. 给管理层的一条战略建议。
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "暂时无法生成团队分析。";
  } catch (error) {
      console.error(error);
      return "生成团队分析时出错。";
  }
}

export const generateExecutiveReport = async (employees: Employee[], deptName: string): Promise<string> => {
    const highPo = employees.filter(e => e.potential === PotentialLevel.High).map(e => e.name).join(', ');
    const highRisk = employees.filter(e => e.flightRisk === 'High').map(e => `${e.name}(${e.role})`).join(', ');
    const successors = employees.filter(e => e.successionStatus !== 'None').length;
    
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `
      请撰写一份正式的 **年度人才盘点总结报告**。
      部门: ${deptName}
      报告日期: ${today}
      
      数据概览:
      - 总人数: ${employees.length}
      - 高潜名单: ${highPo}
      - 高风险人员: ${highRisk}
      - 已识别继任者数量: ${successors}

      报告结构 (Markdown):
      # 年度人才盘点总结报告 - ${deptName}
      **报告日期**: ${today}
      
      ## 1. 执行摘要 (Executive Summary)
      ## 2. 人才结构与关键发现
      ## 3. 风险评估 (Risk Assessment)
      ## 4. 人才行动计划 (Action Plan)
      
      请基于数据进行专业解读，提出具体的管理建议。重点关注如何保留高潜人才以及如何应对流失风险。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "生成报告失败。";
    } catch (error) {
        console.error(error);
        return "API Error";
    }
}

export const generateAnalyticsReport = async (stats: any): Promise<string> => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    作为数据分析专家，请基于以下人才数据生成一份“组织效能分析报告”。
    **重要**: 报告日期必须显示为 ${today}。
    
    数据概览:
    - 继任健康度: ${stats.successionRate}% (覆盖 ${stats.successionCount}/${stats.successionTotal} 关键岗位)
    - 高潜高离职风险人数: ${stats.riskCount} 人
    - 平均司龄: ${stats.avgTenure} 年
    - 司龄分布: ${JSON.stringify(stats.tenureDist)}
    
    请使用 Markdown 格式，包含以下部分：
    1. **数据洞察**: 解读当前数据的含义。
    2. **风险预警**: 针对离职风险和继任缺口提出警告。
    3. **改进建议**: 针对司龄结构和梯队建设的具体建议。
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "生成分析报告失败。";
  } catch (error) {
      console.error(error);
      return "API Error";
  }
}

export const chatWithTalentBot = async (query: string, employees: Employee[], contextName: string): Promise<string> => {
  // Serialize minimal employee data to save tokens
  const employeeData = JSON.stringify(employees.map(e => ({
    name: e.name,
    role: e.role,
    dept: e.department,
    perf: e.performance, // 0=Low, 1=Med, 2=High
    pot: e.potential,    // 0=Low, 1=Med, 2=High
    risk: e.flightRisk,
    succession: e.successionStatus
  })));
  
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  // Enhanced System Instruction to prevent "I can't find data" errors
  const systemInstruction = `
    你是一个智能人才盘点助手 (Talent Bot)。你的核心任务是根据提供的 JSON 数据回答 HR 或管理者的提问。
    
    **上下文定义**:
    - 当前查看的组织/部门名称: "${contextName}"
    - 当前日期: ${today}
    - 数据上下文 (JSON): ${employeeData}

    **核心指令**:
    1. **你拥有完全的数据访问权限**: 上述 JSON 数据就是 "${contextName}" 的**全部**真实员工数据。如果用户问“团队情况”或“部门情况”，指的就是这份数据。
    2. **不要拒绝回答**: 只要问题可以通过分析 JSON 数据得出结论（如统计人数、查找高潜、分析分布），你必须回答。不要说“根据权限我无法找到”，因为数据就在上面。
    3. **数据解释**:
       - 绩效/潜力: 0=低, 1=中, 2=高
       - 离职风险: Low/Medium/High
       - 九宫格定义: 高潜高绩=超级明星, 高潜低绩=潜力之星, 低潜低绩=待改进者。
    4. **回答风格**: 简洁、专业、直接。如果涉及具体员工，请列出姓名。
    5. **隐私**: 不要回答与此 JSON 数据无关的外部世界通用人事隐私，只基于此数据分析。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "我还在思考中，请稍后再试。";
  } catch (error) {
    console.error("Chat Error:", error);
    return "抱歉，我现在无法连接到人才数据库。";
  }
}

// New function to parse org charts or employee lists
export const parseOrgStructure = async (base64Data: string, mimeType: string): Promise<{ department: string }[]> => {
  try {
    const prompt = `
      Analyze the provided file (image or document). 
      Identify all Organizational Departments (e.g., "Sales Dept", "IT", "Marketing", "财务部", "人力资源部").
      
      Return ONLY a raw JSON array of objects. Do not include markdown formatting (like \`\`\`json).
      Format: [{"department": "Name"}]
      
      If you see a hierarchy, extract the distinct department names.
      If you see a list of people with departments, extract the unique department names.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is great for multimodal ingestion
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        { text: prompt }
      ]
    });

    const text = response.text || "[]";
    // Clean potential markdown code blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Org Parse Error:", error);
    return [];
  }
};
