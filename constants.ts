
import { Employee, GridCellDef, PerformanceLevel, PotentialLevel, User } from './types';

// --- Shared Constants ---

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'HR Administrator',
    role: 'HR_BP',
    avatar: 'https://ui-avatars.com/api/?name=HR+Admin&background=0D8ABC&color=fff',
  },
  {
    id: 'u2',
    name: 'Product Manager',
    role: 'MANAGER',
    department: '产品部',
    avatar: 'https://ui-avatars.com/api/?name=Product+Mgr&background=random',
  }
];

export const GRID_CELLS: GridCellDef[] = [
  // Top Row (High Potential)
  { id: 'enigma', title: '潜力之星 (Enigma)', description: '高潜低绩。如未经琢磨的钻石，需要辅导或调整岗位匹配度。', color: 'text-yellow-700', bg: 'bg-yellow-50', potential: PotentialLevel.High, performance: PerformanceLevel.Low },
  { id: 'growth', title: '成长之星 (Growth)', description: '高潜中绩。核心培养对象，给予挑战性任务。', color: 'text-green-700', bg: 'bg-green-50', potential: PotentialLevel.High, performance: PerformanceLevel.Medium },
  { id: 'star', title: '超级明星 (Super Star)', description: '高潜高绩。企业的未来领袖，应予以重任和晋升保留。', color: 'text-blue-700', bg: 'bg-blue-50', potential: PotentialLevel.High, performance: PerformanceLevel.High },

  // Middle Row (Medium Potential)
  { id: 'dilemma', title: '待激活 (Dilemma)', description: '中潜低绩。需要制定绩效改进计划(PIP)或深入分析原因。', color: 'text-orange-700', bg: 'bg-orange-50', potential: PotentialLevel.Medium, performance: PerformanceLevel.Low },
  { id: 'core', title: '核心骨干 (Core)', description: '中潜中绩。组织的中坚力量，保持其敬业度。', color: 'text-gray-700', bg: 'bg-gray-50', potential: PotentialLevel.Medium, performance: PerformanceLevel.Medium },
  { id: 'high-impact', title: '高绩效专家 (High Impact)', description: '中潜高绩。在该岗位表现优异，应保持高激励。', color: 'text-indigo-700', bg: 'bg-indigo-50', potential: PotentialLevel.Medium, performance: PerformanceLevel.High },

  // Bottom Row (Low Potential)
  { id: 'underperformer', title: '待改进/淘汰 (Underperformer)', description: '低潜低绩。需考虑调岗或优化淘汰。', color: 'text-red-700', bg: 'bg-red-50', potential: PotentialLevel.Low, performance: PerformanceLevel.Low },
  { id: 'effective', title: '稳定贡献者 (Effective)', description: '低潜中绩。表现符合预期，维持现有状态。', color: 'text-slate-700', bg: 'bg-slate-50', potential: PotentialLevel.Low, performance: PerformanceLevel.Medium },
  { id: 'trusted', title: '资深专家 (Trusted)', description: '低潜高绩。经验丰富的专业人士，适合作为导师。', color: 'text-teal-700', bg: 'bg-teal-50', potential: PotentialLevel.Low, performance: PerformanceLevel.High },
];

// --- Tenant Data: Tech Corp (Original Data) ---
const TECH_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: '陈莎莎',
    role: '高级产品经理',
    department: '产品部',
    avatar: 'https://picsum.photos/100/100?random=1',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.High,
    tenure: 3.5,
    flightRisk: 'Medium',
    lastReviewDate: '2023-12-01',
    keyStrengths: ['战略视野', '领导力', '数据分析'],
    developmentNeeds: ['公众演讲', '授权管理'],
    successionStatus: 'Ready-Future',
    targetRole: '产品总监',
    careerAspiration: '希望在2年内负责一条完整的产品线业务。'
  },
  {
    id: '2',
    name: '李迈克',
    role: '软件工程师 II',
    department: '研发部',
    avatar: 'https://picsum.photos/100/100?random=2',
    performance: PerformanceLevel.Medium,
    potential: PotentialLevel.High,
    tenure: 1.2,
    flightRisk: 'Low',
    lastReviewDate: '2024-01-15',
    keyStrengths: ['代码效率', '创新能力', '团队协作'],
    developmentNeeds: ['系统架构', '文档规范'],
    successionStatus: 'Ready-Future',
    targetRole: '技术专家 (Staff Engineer)',
    careerAspiration: '专注于后端架构深度，成为技术专家。'
  },
  {
    id: '3',
    name: '张杰茜',
    role: '销售副总裁',
    department: '销售部',
    avatar: 'https://picsum.photos/100/100?random=3',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.Medium,
    tenure: 5.0,
    flightRisk: 'High',
    lastReviewDate: '2023-11-20',
    keyStrengths: ['商务谈判', '客户关系', '收入增长'],
    developmentNeeds: ['跨部门协作'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '维持现有高产出，寻求期权激励。'
  },
  {
    id: '4',
    name: '刘路易',
    role: '法务顾问',
    department: '法务部',
    avatar: 'https://picsum.photos/100/100?random=4',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.Low,
    tenure: 8.0,
    flightRisk: 'Low',
    lastReviewDate: '2023-10-05',
    keyStrengths: ['合规性', '风险管理', '细节导向'],
    developmentNeeds: ['情商管理', '灵活性'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '稳定工作，平衡生活。'
  },
  {
    id: '5',
    name: '瑞秋',
    role: '法务助理',
    department: '法务部',
    avatar: 'https://picsum.photos/100/100?random=5',
    performance: PerformanceLevel.Medium,
    potential: PotentialLevel.Medium,
    tenure: 2.0,
    flightRisk: 'Medium',
    lastReviewDate: '2024-02-01',
    keyStrengths: ['调研能力', '组织能力', '敬业精神'],
    developmentNeeds: ['自信心', '法律文书'],
    successionStatus: 'Ready-Future',
    targetRole: '法务顾问',
    careerAspiration: '考取高级律师资格证，独立负责项目。'
  },
  {
    id: '6',
    name: '何伟',
    role: '执行合伙人',
    department: '管理层',
    avatar: 'https://picsum.photos/100/100?random=6',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.High,
    tenure: 10.0,
    flightRisk: 'High',
    lastReviewDate: '2023-12-15',
    keyStrengths: ['交易撮合', '企业战略', '导师精神'],
    developmentNeeds: ['耐心', '工作生活平衡'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '退休或转为顾问。'
  },
  {
    id: '7',
    name: '唐娜',
    role: '首席运营官',
    department: '运营部',
    avatar: 'https://picsum.photos/100/100?random=7',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.Medium,
    tenure: 12.0,
    flightRisk: 'Low',
    lastReviewDate: '2023-11-01',
    keyStrengths: ['运营管理', '识人能力', '效率提升'],
    developmentNeeds: ['技术理解力'],
    successionStatus: 'None',
    targetRole: '执行合伙人',
    careerAspiration: '接任公司一把手位置。'
  },
  {
    id: '8',
    name: '哈罗德',
    role: '初级专员',
    department: '法务部',
    avatar: 'https://picsum.photos/100/100?random=8',
    performance: PerformanceLevel.Low,
    potential: PotentialLevel.Medium,
    tenure: 0.8,
    flightRisk: 'Low',
    lastReviewDate: '2024-03-01',
    keyStrengths: ['积极性', '忠诚度'],
    developmentNeeds: ['细节把控', '抗压能力'],
    successionStatus: 'None',
    targetRole: '法务助理',
    careerAspiration: '快速适应职场。'
  },
  {
    id: '9',
    name: '卡特琳娜',
    role: '高级顾问',
    department: '法务部',
    avatar: 'https://picsum.photos/100/100?random=9',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.High,
    tenure: 4.0,
    flightRisk: 'Medium',
    lastReviewDate: '2023-12-10',
    keyStrengths: ['逻辑思维', '执行力', '忠诚度'],
    developmentNeeds: ['软技能'],
    successionStatus: 'Ready-Now',
    targetRole: '法务合伙人',
    careerAspiration: '成为事务所最年轻的合伙人。'
  }
];

// --- Tenant Data: Retail Group (New Data) ---
const RETAIL_EMPLOYEES: Employee[] = [
  {
    id: 'r1',
    name: '王强',
    role: '华东区总经理',
    department: '区域运营部',
    avatar: 'https://ui-avatars.com/api/?name=Wang+Qiang&background=random',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.High,
    tenure: 8.5,
    flightRisk: 'Low',
    lastReviewDate: '2023-12-01',
    keyStrengths: ['大客户管理', '成本控制', '团队激励'],
    developmentNeeds: ['数字化思维'],
    successionStatus: 'Ready-Now',
    targetRole: '全国运营副总裁',
    careerAspiration: '进入集团核心决策层。'
  },
  {
    id: 'r2',
    name: '苏菲',
    role: '旗舰店店长',
    department: '门店管理部',
    avatar: 'https://ui-avatars.com/api/?name=Sophie&background=random',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.Medium,
    tenure: 4.0,
    flightRisk: 'High',
    lastReviewDate: '2024-01-10',
    keyStrengths: ['客户服务', '库存管理', '员工培训'],
    developmentNeeds: ['宏观战略'],
    successionStatus: 'Ready-Future',
    targetRole: '区域经理',
    careerAspiration: '希望管理更大的区域，获得更多分红。'
  },
  {
    id: 'r3',
    name: '张敏',
    role: '供应链专员',
    department: '供应链中心',
    avatar: 'https://ui-avatars.com/api/?name=Zhang+Min&background=random',
    performance: PerformanceLevel.Medium,
    potential: PotentialLevel.Low,
    tenure: 1.5,
    flightRisk: 'Medium',
    lastReviewDate: '2024-02-15',
    keyStrengths: ['流程执行', '数据录入'],
    developmentNeeds: ['主动性', '沟通技巧'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '稳定工作。'
  },
  {
    id: 'r4',
    name: '李雷',
    role: '采购主管',
    department: '供应链中心',
    avatar: 'https://ui-avatars.com/api/?name=Li+Lei&background=random',
    performance: PerformanceLevel.Low,
    potential: PotentialLevel.Medium,
    tenure: 2.0,
    flightRisk: 'Low',
    lastReviewDate: '2024-01-20',
    keyStrengths: ['供应商关系'],
    developmentNeeds: ['合规意识', '谈判能力'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '提升专业技能。'
  },
  {
    id: 'r5',
    name: 'Emma Liu',
    role: '首席营销官',
    department: '市场部',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Liu&background=random',
    performance: PerformanceLevel.High,
    potential: PotentialLevel.High,
    tenure: 1.0,
    flightRisk: 'Medium',
    lastReviewDate: '2023-11-01',
    keyStrengths: ['品牌塑造', '数字营销', '创新'],
    developmentNeeds: ['组织文化融合'],
    successionStatus: 'None',
    targetRole: '',
    careerAspiration: '打造行业标杆案例。'
  }
];

// Default Export for backward compatibility (points to Tech Corp)
export const INITIAL_EMPLOYEES = TECH_EMPLOYEES;

// --- Multi-Tenancy Configuration ---

export const TENANT_META: Record<string, string> = {
  'tech_corp': 'TechFlow Innovations (科技流)',
  'retail_grp': 'NorthStar Retail Group (北极星零售)',
};

export const MOCK_TENANTS: Record<string, Employee[]> = {
  'tech_corp': TECH_EMPLOYEES,
  'retail_grp': RETAIL_EMPLOYEES,
};

// --- Seed Data Generator for New Tenants ---
export const generateSeedEmployees = (tenantName: string): Employee[] => {
  return [
    {
      id: `seed-${Date.now()}-1`,
      name: '示例员工-高潜',
      role: '高级经理',
      department: '业务部',
      avatar: 'https://ui-avatars.com/api/?name=High+Pot&background=random',
      performance: PerformanceLevel.High,
      potential: PotentialLevel.High,
      tenure: 3,
      flightRisk: 'Low',
      lastReviewDate: new Date().toISOString().split('T')[0],
      keyStrengths: ['执行力', '学习能力'],
      developmentNeeds: ['战略思维'],
      successionStatus: 'Ready-Future',
      targetRole: '总监',
      careerAspiration: '成为业务合伙人'
    },
    {
      id: `seed-${Date.now()}-2`,
      name: '示例员工-骨干',
      role: '专员',
      department: '运营部',
      avatar: 'https://ui-avatars.com/api/?name=Core+Emp&background=random',
      performance: PerformanceLevel.Medium,
      potential: PotentialLevel.Medium,
      tenure: 1.5,
      flightRisk: 'Medium',
      lastReviewDate: new Date().toISOString().split('T')[0],
      keyStrengths: ['细心', '负责'],
      developmentNeeds: ['效率提升'],
      successionStatus: 'None',
      targetRole: '',
      careerAspiration: '稳定发展'
    }
  ];
};
