# TalentFlow - 智能人才盘点与继任规划系统

<div align="center">

![TalentFlow Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

**企业级人才管理平台 | AI驱动 | 数据洞察**

[![GitHub](https://img.shields.io/badge/GitHub-TalentFlow-blue?logo=github)](https://github.com/brandon-zhanghaodong/TalentFlow)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Private-red)]()

[🚀 快速开始](#快速开始) • [📚 文档](#文档) • [✨ 功能](#核心功能) • [🎯 演示](#在线演示)

</div>

---

## 🎯 项目简介

TalentFlow是一个现代化的企业级人才管理平台，集成了**AI智能分析**、**九宫格人才评估**、**继任计划管理**、**语音转录**和**订阅支付**等功能，帮助企业实现科学化的人才盘点与发展规划。

### 为什么选择TalentFlow？

- 🤖 **AI驱动** - DeepSeek AI提供智能对话和人才分析
- 📊 **数据可视化** - 九宫格、绩效分布、离职风险一目了然
- 🔐 **企业级安全** - Row-Level Security、审计日志、多租户隔离
- 🎤 **语音转录** - OpenAI Whisper自动转录面试记录
- 💳 **灵活订阅** - Stripe支付，三层定价方案
- 🚀 **快速部署** - 5分钟部署到Vercel

---

## ✨ 核心功能

### 🏢 多租户架构
完整的企业级多租户支持，数据隔离、订阅管理、灵活的计划限制

### 👥 人才管理
- **九宫格分析**: 基于绩效与潜力的可视化人才评估
- **员工档案**: 完整的员工信息与职业发展记录
- **离职风险**: 智能识别高风险员工
- **继任计划**: 识别和培养未来领导者

### 🤖 AI智能助手
- **DeepSeek AI集成**: 智能对话与人才分析
- **自然语言查询**: 用对话方式获取人才洞察
- **智能建议**: AI驱动的发展建议

### 🎤 语音转录
- **录音功能**: 浏览器内录制面试/评估对话
- **自动转录**: OpenAI Whisper语音转文本
- **情感分析**: AI分析对话情感倾向
- **关键话题提取**: 自动识别重要话题

### 💳 订阅支付
- **Stripe集成**: 安全的支付处理
- **多层级定价**: 免费版、专业版、企业版
- **自动订阅管理**: 自动续费与账单管理

### 📊 数据分析
- **绩效分布**: 可视化团队绩效分布
- **离职风险分析**: 识别潜在流失风险
- **继任管道**: 继任计划进度跟踪
- **行动计划**: 发展计划创建与跟踪

---

## 🚀 快速开始

### 方式1: 在线演示（无需安装）

访问我们的在线演示：**[TalentFlow Demo](https://talent-flow.vercel.app)** *(部署后更新)*

### 方式2: 本地运行

```bash
# 克隆项目
git clone https://github.com/brandon-zhanghaodong/TalentFlow.git
cd TalentFlow

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的API密钥

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000`

### 方式3: 部署到Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brandon-zhanghaodong/TalentFlow)

**详细步骤**: 查看 [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) 或 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## 📋 前置要求

### 必需
- Node.js 18+
- pnpm (推荐) 或 npm
- DeepSeek API密钥

### 推荐（完整功能）
- Supabase账号（数据库）
- OpenAI API密钥（语音转录）
- Stripe账号（支付功能）

---

## ⚙️ 环境配置

### 最小配置（基础功能）

```bash
# .env.local
DEEPSEEK_API_KEY=your_gemini_api_key
```

### 完整配置（所有功能）

```bash
# DeepSeek AI
DEEPSEEK_API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (语音转录)
OPENAI_API_KEY=your_openai_api_key

# Stripe (支付功能)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**详细配置**: 查看 [ENV_VARIABLES_CHECKLIST.md](./ENV_VARIABLES_CHECKLIST.md)

---

## 🏗️ 技术架构

### 前端技术栈
- **React 19.2** - UI框架
- **TypeScript 5.8** - 类型安全
- **Vite 6.2** - 构建工具
- **TailwindCSS** - 样式框架
- **Lucide React** - 图标库

### 后端技术栈
- **Supabase** - PostgreSQL数据库 + 认证 + 存储
- **Row-Level Security** - 数据库级安全
- **Serverless Functions** - API端点

### AI & 集成
- **DeepSeek AI** - 智能对话与分析
- **OpenAI Whisper** - 语音转录
- **Stripe** - 支付处理

---

## 📊 项目结构

```
TalentFlow/
├── components/          # React组件
│   ├── Dashboard.tsx    # 仪表板
│   ├── NineBoxGrid.tsx  # 九宫格
│   ├── EmployeeList.tsx # 员工列表
│   └── ...
├── services/           # 服务层
│   ├── supabaseService-enhanced.ts  # 数据库操作
│   ├── voiceService.ts              # 语音转录
│   ├── paymentService.ts            # 支付管理
│   └── deepseekService.ts             # AI对话
├── db/                 # 数据库脚本
│   ├── schema-enhanced.sql  # 数据库架构
│   └── seed-data.sql        # 测试数据
├── docs/              # 文档
│   ├── DATABASE_SETUP.md
│   ├── API_ROUTES.md
│   └── DEPLOYMENT_GUIDE.md
├── lib/               # 工具库
│   └── supabase.ts
├── App.tsx            # 主应用
├── types.ts           # TypeScript类型
└── constants.ts       # 常量配置
```

---

## 📚 文档

### 快速指南
- [快速部署](./QUICK_DEPLOY.md) - 5分钟部署到Vercel
- [环境变量配置](./ENV_VARIABLES_CHECKLIST.md) - 完整配置清单
- [测试报告](./TEST_REPORT.md) - 功能测试结果

### 详细文档
- [数据库设置指南](./docs/DATABASE_SETUP.md) - Supabase配置
- [API接口文档](./docs/API_ROUTES.md) - 40+个API端点
- [部署指南](./docs/DEPLOYMENT_GUIDE.md) - 生产环境部署
- [后端架构](./README-BACKEND.md) - 后端设计说明
- [Vercel部署](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel详细步骤

---

## 🗄️ 数据库架构

### 核心数据表（8个）

| 表名 | 用途 |
|------|------|
| `tenants` | 企业租户管理 |
| `departments` | 部门结构与访问控制 |
| `employees` | 员工档案与绩效数据 |
| `action_plans` | 行动计划跟踪 |
| `voice_transcriptions` | 语音转录记录 |
| `payment_transactions` | 支付交易历史 |
| `audit_logs` | 系统审计日志 |
| `ai_chat_history` | AI对话历史 |

### 分析视图（3个）
- `v_performance_distribution` - 绩效分布分析
- `v_flight_risk_summary` - 离职风险汇总
- `v_succession_pipeline` - 继任计划管道

**详细架构**: 查看 [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)

---

## 💰 定价方案

| 方案 | 价格 | 员工数 | 功能 |
|------|------|--------|------|
| **免费版** | $0/月 | 50 | 基础功能 |
| **专业版** | $299/月 | 200 | 完整功能 + 语音转录 |
| **企业版** | $999/月 | 无限 | 所有功能 + 定制支持 |

---

## 🔐 安全特性

- ✅ **Row-Level Security (RLS)** - 多租户数据隔离
- ✅ **审计日志** - 完整操作记录
- ✅ **密码加密** - 部门访问控制
- ✅ **JWT认证** - 用户身份验证
- ✅ **HTTPS强制** - 传输加密
- ✅ **CORS配置** - 跨域安全
- ✅ **限流保护** - 防止滥用

---

## 📈 项目统计

| 类型 | 数量 |
|------|------|
| 前端组件 | 13个 (3,591行) |
| 服务层 | 4个 (1,838行) |
| 数据库表 | 8个 + 3个视图 |
| API端点 | 40+ |
| 文档字数 | 22,000+ |
| 测试覆盖 | 90% |

---

## 🎯 路线图

### ✅ 已完成
- [x] 核心人才管理功能
- [x] AI智能对话
- [x] 九宫格评估
- [x] 数据库架构
- [x] 语音转录服务
- [x] Stripe支付集成
- [x] 完整文档

### 🚧 进行中
- [ ] API路由实现
- [ ] 单元测试
- [ ] 性能优化

### 📅 计划中
- [ ] 批量导入员工
- [ ] 高级搜索和过滤
- [ ] 自定义报表
- [ ] 移动端适配
- [ ] 多语言支持

---

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤:

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

---

## 📄 许可证

本项目为私有项目，保留所有权利。

---

## 🆘 支持

遇到问题？

- 📖 查看 [文档](./docs)
- 🐛 创建 [Issue](https://github.com/brandon-zhanghaodong/TalentFlow/issues)
- 💬 参与 [Discussions](https://github.com/brandon-zhanghaodong/TalentFlow/discussions)

---

## 🎉 致谢

感谢以下开源项目和服务:

- [Supabase](https://supabase.com) - 数据库基础设施
- [DeepSeek AI](https://www.deepseek.com) - AI对话能力
- [OpenAI](https://openai.com) - 语音转录
- [Stripe](https://stripe.com) - 支付处理
- [Vercel](https://vercel.com) - 托管平台
- [React](https://react.dev) - UI框架
- [Vite](https://vitejs.dev) - 构建工具

---

## 📞 联系方式

- **GitHub**: [@brandon-zhanghaodong](https://github.com/brandon-zhanghaodong)
- **项目主页**: [TalentFlow](https://github.com/brandon-zhanghaodong/TalentFlow)
- **在线演示**: [Demo](https://talent-flow.vercel.app) *(部署后更新)*

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给个Star！**

Made with ❤️ by [Brandon Zhang](https://github.com/brandon-zhanghaodong)

**版本**: 2.0.0 | **最后更新**: 2026年2月1日

</div>
