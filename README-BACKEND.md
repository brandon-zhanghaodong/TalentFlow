# TalentFlow - 后端与数据库配置文档

## 🎯 项目简介

TalentFlow是一个企业级人才管理平台，本文档详细说明后端架构、数据库配置和服务层实现。

## ✨ 新增功能

### 🗄️ 完整的数据库架构
- **8个核心数据表**: 租户、部门、员工、行动计划、语音转录、支付交易、审计日志、AI对话
- **3个分析视图**: 绩效分布、离职风险、继任管道
- **Row-Level Security**: 多租户数据隔离
- **15+性能索引**: 优化查询性能

### 🔧 增强的服务层
- **supabaseService-enhanced.ts** (800行): 完整的数据库CRUD操作
- **voiceService.ts** (400行): 语音录制、转录、AI分析
- **paymentService.ts** (400行): Stripe支付与订阅管理

### 📚 完善的文档
- **DATABASE_SETUP.md**: 数据库部署完整指南
- **API_ROUTES.md**: 40+个API端点详细规范
- **DEPLOYMENT_GUIDE.md**: 生产环境部署步骤

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```bash
# 必需
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可选（完整功能）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_xxx
OPENAI_API_KEY=sk-xxx
```

### 3. 设置数据库

#### 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 保存数据库密码

#### 运行数据库迁移

在Supabase SQL Editor中:

```sql
-- 复制并运行 db/schema-enhanced.sql 的内容
```

#### 导入测试数据（可选）

```sql
-- 复制并运行 db/seed-data.sql 的内容
```

详细步骤: [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md)

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173`

## 🗄️ 数据库架构

### 核心数据表

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| `tenants` | 企业租户管理 | 订阅状态、计划级别、Stripe客户ID |
| `departments` | 部门结构与访问控制 | 访问密码、经理信息 |
| `employees` | 员工档案与绩效数据 | 绩效等级、潜力等级、离职风险 |
| `action_plans` | 行动计划跟踪 | 类别、状态、优先级 |
| `voice_transcriptions` | 语音转录记录 | 转录文本、情感分析 |
| `payment_transactions` | 支付交易记录 | Stripe支付ID、金额 |
| `audit_logs` | 审计日志 | 操作类型、变更详情 |
| `ai_chat_history` | AI对话历史 | 会话ID、消息内容 |

### 分析视图

- `v_performance_distribution` - 绩效分布分析
- `v_flight_risk_summary` - 离职风险汇总
- `v_succession_pipeline` - 继任计划管道

### 安全特性

- ✅ Row-Level Security (RLS) - 租户数据隔离
- ✅ 自动审计日志 - 记录所有数据变更
- ✅ 密码加密 - 部门访问控制
- ✅ 数据验证 - CHECK约束

## 🔧 服务层

### Supabase服务 (`services/supabaseService-enhanced.ts`)

完整的数据库操作:

```typescript
// 租户管理
await getTenant('company_slug');
await createTenant('Company Name', 'company_slug');
await updateTenant(tenantId, { plan_level: 'pro' });

// 员工管理
await fetchEmployees(tenantId);
await createEmployee(tenantId, employeeData);
await updateEmployee(employeeId, updates);
await deleteEmployee(employeeId);

// 行动计划
await fetchActionPlans(tenantId);
await createActionPlan(tenantId, planData);
await updateActionPlan(planId, updates);

// 分析数据
await getPerformanceDistribution(tenantId);
await getFlightRiskSummary(tenantId);
await getSuccessionPipeline(tenantId);
```

### 语音服务 (`services/voiceService.ts`)

语音录制与转录:

```typescript
// 完整工作流
const result = await processVoiceRecording(
  audioFile,
  tenantId,
  employeeId,
  'HR Manager'
);

// 浏览器录音
const recorder = new AudioRecorder();
await recorder.startRecording();
const { audioBlob } = await recorder.stopRecording();
const file = blobToFile(audioBlob, 'recording.webm');
```

**功能**:
- 浏览器内录音（MediaRecorder API）
- 音频文件上传
- 自动语音转文本（OpenAI Whisper）
- AI情感分析
- 关键话题提取
- 行动项识别

### 支付服务 (`services/paymentService.ts`)

Stripe订阅管理:

```typescript
// 创建支付意图
const { clientSecret } = await createPaymentIntent(
  tenantId,
  'pro',
  'monthly'
);

// 确认支付
await confirmPayment(tenantId, paymentIntentId, 'pro');

// 取消订阅
await cancelSubscription(tenantId, subscriptionId);
```

**定价方案**:
- 免费版: $0/月（50员工）
- 专业版: $299/月（200员工）
- 企业版: $999/月（无限员工）

## 📡 API接口

### 端点概览

完整的API规范请参考: [docs/API_ROUTES.md](./docs/API_ROUTES.md)

**核心端点**:
- `/api/employees` - 员工管理（GET, POST, PATCH, DELETE）
- `/api/action-plans` - 行动计划（GET, POST, PATCH, DELETE）
- `/api/voice/upload` - 语音上传
- `/api/voice/transcriptions` - 转录结果
- `/api/payments/create-intent` - 创建支付
- `/api/payments/confirm` - 确认支付
- `/api/analytics/*` - 分析数据

### 实现示例（Vercel）

创建 `api/employees/index.ts`:

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchEmployees, createEmployee } from '../../services/supabaseService-enhanced';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { tenant_id } = req.query;

  if (req.method === 'GET') {
    const employees = await fetchEmployees(tenant_id as string);
    return res.json({ success: true, employees });
  }

  if (req.method === 'POST') {
    const employee = await createEmployee(tenant_id as string, req.body);
    return res.json({ success: true, employee });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

## 🚢 部署

### Vercel部署（推荐）

```bash
# 安装Vercel CLI
pnpm add -g vercel

# 部署
vercel
```

### 环境变量设置

在Vercel控制台设置:

```
GEMINI_API_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
OPENAI_API_KEY=xxx
```

### 第三方服务配置

#### Stripe设置

1. 创建产品和价格
2. 配置Webhooks: `https://your-app.com/api/payments/webhook`
3. 选择事件: `payment_intent.*`, `customer.subscription.*`
4. 复制webhook secret

#### OpenAI设置

1. 获取API密钥: [platform.openai.com](https://platform.openai.com)
2. 添加到环境变量

详细部署步骤: [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

## 📊 项目结构

```
TalentFlow/
├── db/                          # 数据库脚本
│   ├── schema-enhanced.sql      # 完整数据库架构
│   ├── seed-data.sql            # 测试数据
│   └── migrations/              # 数据库迁移
├── docs/                        # 文档
│   ├── DATABASE_SETUP.md        # 数据库设置指南
│   ├── API_ROUTES.md            # API接口文档
│   └── DEPLOYMENT_GUIDE.md      # 部署指南
├── services/                    # 服务层
│   ├── supabaseService-enhanced.ts  # 数据库操作
│   ├── voiceService.ts              # 语音转录
│   ├── paymentService.ts            # 支付管理
│   └── geminiService.ts             # AI对话
├── lib/                         # 工具库
│   └── supabase.ts              # Supabase客户端
├── components/                  # React组件
├── .env.example                 # 环境变量模板
└── package.json                 # 项目配置
```

## 🔐 安全最佳实践

### 数据库安全

- ✅ 启用Row-Level Security (RLS)
- ✅ 使用service_role key进行服务端操作
- ✅ 永不在前端暴露service_role key
- ✅ 定期审查RLS策略

### API安全

- ✅ 验证所有输入
- ✅ 实施限流保护
- ✅ 使用HTTPS
- ✅ 配置CORS
- ✅ 记录审计日志

### 密钥管理

- ✅ 使用环境变量存储密钥
- ✅ 定期轮换API密钥
- ✅ 分离开发和生产环境密钥
- ✅ 使用密钥管理服务（生产环境）

## 📈 性能优化

### 数据库优化

- ✅ 15+个性能索引已配置
- ✅ 使用连接池（生产环境）
- ✅ 定期分析慢查询
- ✅ 考虑添加缓存层（Redis）

### 前端优化

- ✅ 代码分割（Vite自动处理）
- ✅ 图片优化
- ✅ CDN加速静态资源
- ✅ 懒加载组件

## 🧪 测试

### 数据库测试

```sql
-- 验证表创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 验证RLS启用
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- 测试查询性能
EXPLAIN ANALYZE 
SELECT * FROM employees WHERE tenant_id = 'xxx';
```

### API测试

```bash
# 测试员工列表
curl https://your-app.com/api/employees?tenant_id=xxx

# 测试创建员工
curl -X POST https://your-app.com/api/employees \
  -H "Content-Type: application/json" \
  -d '{"tenant_id":"xxx","name":"张三","role":"工程师"}'
```

## 🐛 故障排查

### 常见问题

#### 数据库连接失败

- 检查Supabase项目状态（免费版会休眠）
- 验证环境变量配置
- 检查网络连接

#### RLS阻止查询

- 使用service_role key进行服务端操作
- 检查RLS策略配置
- 验证JWT claims

#### 支付失败

- 检查Stripe密钥配置
- 验证webhook签名
- 查看Stripe日志

## 📚 学习资源

- [Supabase文档](https://supabase.com/docs)
- [Stripe API文档](https://stripe.com/docs/api)
- [OpenAI API文档](https://platform.openai.com/docs)
- [Vercel文档](https://vercel.com/docs)

## 🤝 贡献

欢迎贡献！请遵循:

1. Fork仓库
2. 创建特性分支
3. 提交更改
4. 创建Pull Request

## 📞 支持

- 查看 [docs/](./docs) 目录文档
- 在GitHub创建Issue
- 联系项目维护者

## 📝 更新日志

### v2.0.0 (2026-02-01)

**新增**:
- ✅ 完整的数据库架构（8表+3视图）
- ✅ 增强的服务层（3个核心服务）
- ✅ 语音转录功能
- ✅ Stripe支付集成
- ✅ 完善的文档体系

**改进**:
- ✅ 添加Row-Level Security
- ✅ 添加审计日志
- ✅ 性能优化（索引）
- ✅ 类型安全增强

---

**版本**: 2.0.0  
**最后更新**: 2026年2月1日  
**GitHub**: https://github.com/brandon-zhanghaodong/TalentFlow
