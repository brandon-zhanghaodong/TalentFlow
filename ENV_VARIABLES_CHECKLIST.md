# TalentFlow - 环境变量配置清单

## 📋 Vercel环境变量配置

在Vercel部署时，需要添加以下环境变量。

---

## ✅ 必需变量（必须配置）

### 1. Gemini AI API密钥

```
Name: GEMINI_API_KEY
Value: AIzaSyBw-G4vRpIlVDdFf0_bQjsXuujPMSzT5Co
Environment: Production, Preview, Development (全选)
```

**用途**: AI对话功能  
**状态**: ✅ 已测试，可用

---

## ⚠️ 推荐变量（强烈建议配置）

### 2. Supabase项目URL

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environment: Production, Preview, Development (全选)
```

**用途**: 数据库连接  
**获取方式**: Supabase项目 → Settings → API → Project URL  
**状态**: ⚠️ 待配置

### 3. Supabase匿名密钥

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development (全选)
```

**用途**: 客户端数据库访问  
**获取方式**: Supabase项目 → Settings → API → anon public  
**状态**: ⚠️ 待配置

### 4. Supabase服务角色密钥

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development (全选)
```

**用途**: 服务端数据库操作  
**获取方式**: Supabase项目 → Settings → API → service_role  
**状态**: ⚠️ 待配置  
**注意**: ⚠️ 此密钥非常敏感，切勿泄露

---

## 🔧 可选变量（按需配置）

### 5. OpenAI API密钥

```
Name: OPENAI_API_KEY
Value: sk-proj-xxxxx
Environment: Production, Preview, Development (全选)
```

**用途**: 语音转录功能  
**获取方式**: https://platform.openai.com/api-keys  
**状态**: ❌ 当前密钥无效，需要更新  
**注意**: 如不配置，语音转录功能将不可用

### 6. Stripe密钥（测试环境）

```
Name: STRIPE_SECRET_KEY
Value: sk_test_xxxxx
Environment: Development, Preview
```

**用途**: 支付功能（测试）  
**获取方式**: https://dashboard.stripe.com/test/apikeys  
**状态**: ⚠️ 待配置

```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_xxxxx
Environment: Development, Preview
```

**用途**: 前端支付组件  
**获取方式**: https://dashboard.stripe.com/test/apikeys  
**状态**: ⚠️ 待配置

### 7. Stripe密钥（生产环境）

```
Name: STRIPE_SECRET_KEY
Value: sk_live_xxxxx
Environment: Production
```

**用途**: 支付功能（生产）  
**获取方式**: https://dashboard.stripe.com/apikeys  
**状态**: ⚠️ 待配置  
**注意**: ⚠️ 仅在准备接受真实支付时配置

```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_xxxxx
Environment: Production
```

### 8. Stripe Webhook密钥

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxx
Environment: Production, Preview
```

**用途**: 验证Stripe Webhook签名  
**获取方式**: Stripe Dashboard → Webhooks → 添加端点后获取  
**状态**: ⚠️ 待配置

---

## 📊 配置优先级

### 最小可用配置（基础功能）

仅配置以下变量即可部署：

- ✅ `GEMINI_API_KEY`

**可用功能**:
- ✅ 前端UI
- ✅ AI对话
- ✅ 本地模拟数据

**不可用功能**:
- ❌ 数据库持久化
- ❌ 语音转录
- ❌ 支付功能

---

### 推荐配置（完整功能）

配置以下变量获得完整体验：

- ✅ `GEMINI_API_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `OPENAI_API_KEY`（需要有效密钥）

**可用功能**:
- ✅ 前端UI
- ✅ AI对话
- ✅ 数据库持久化
- ✅ 员工管理
- ✅ 九宫格分析
- ✅ 行动计划
- ✅ 语音转录

**不可用功能**:
- ❌ 支付功能（需要Stripe配置）

---

### 生产配置（商业部署）

配置所有变量用于商业运营：

- ✅ 所有上述变量
- ✅ Stripe生产密钥
- ✅ Stripe Webhook密钥

**可用功能**:
- ✅ 所有功能完整可用

---

## 🔐 安全注意事项

### 敏感密钥

以下密钥**绝对不能**泄露：

1. ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - 完全数据库访问权限
2. ⚠️ `STRIPE_SECRET_KEY` - 可以执行支付操作
3. ⚠️ `STRIPE_WEBHOOK_SECRET` - 验证支付事件
4. ⚠️ `OPENAI_API_KEY` - 可能产生费用

### 安全最佳实践

- ✅ 仅在Vercel环境变量中配置，不要提交到Git
- ✅ 定期轮换API密钥（建议每3-6个月）
- ✅ 为不同环境使用不同的密钥
- ✅ 监控API使用量，设置预算警报
- ✅ 启用API密钥的IP白名单（如果支持）

---

## 📝 配置步骤

### 在Vercel中添加环境变量

1. 登录Vercel
2. 进入TalentFlow项目
3. 点击 **"Settings"** 标签
4. 点击左侧 **"Environment Variables"**
5. 对于每个变量：
   - 输入 **Name**（变量名）
   - 输入 **Value**（变量值）
   - 选择环境：**Production**, **Preview**, **Development**
   - 点击 **"Add"**
6. 所有变量添加完成后，点击 **"Redeploy"** 重新部署

---

## ✅ 验证配置

### 部署后检查

1. **访问网站**
   - 打开Vercel提供的URL
   - 检查页面是否正常加载

2. **测试AI对话**
   - 在HomeChat页面发送消息
   - 验证Gemini AI响应

3. **测试数据库连接**（如果配置了Supabase）
   - 登录系统
   - 查看员工列表
   - 尝试创建新员工

4. **测试语音转录**（如果配置了OpenAI）
   - 录制音频
   - 检查转录结果

5. **检查浏览器控制台**
   - 按F12打开开发者工具
   - 查看Console标签
   - 确认没有API密钥相关错误

---

## 🆘 故障排查

### 常见错误

#### 错误1: "GEMINI_API_KEY is not defined"

**原因**: 环境变量未配置或未生效  
**解决**:
1. 检查Vercel环境变量设置
2. 确认变量名拼写正确
3. 重新部署项目

#### 错误2: "Supabase client is not configured"

**原因**: Supabase环境变量缺失  
**解决**:
1. 添加所有3个Supabase变量
2. 确认URL格式正确（包含https://）
3. 重新部署

#### 错误3: "OpenAI API authentication failed"

**原因**: OpenAI密钥无效或过期  
**解决**:
1. 访问OpenAI平台生成新密钥
2. 更新Vercel环境变量
3. 重新部署

#### 错误4: 页面空白

**原因**: 通常是环境变量配置问题  
**解决**:
1. 打开浏览器控制台查看具体错误
2. 检查所有必需变量是否配置
3. 确认变量值正确无误

---

## 📋 快速复制清单

### 复制以下内容到Vercel

```
# 必需
GEMINI_API_KEY=AIzaSyBw-G4vRpIlVDdFf0_bQjsXuujPMSzT5Co

# Supabase（推荐）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI（可选）
OPENAI_API_KEY=your_valid_key

# Stripe测试（可选）
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

**注意**: 替换 `your_xxx` 为实际值！

---

## 🎯 配置完成标志

当您完成配置后，应该看到：

- ✅ Vercel环境变量页面显示所有已添加的变量
- ✅ 部署状态为 "Ready"
- ✅ 网站可以正常访问
- ✅ 浏览器控制台无环境变量错误
- ✅ 核心功能可以正常使用

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 查看 **VERCEL_DEPLOYMENT_GUIDE.md** 完整部署指南
2. 查看 **TEST_REPORT.md** 了解项目功能
3. 查看 **docs/DEPLOYMENT_GUIDE.md** 详细部署文档
4. 在GitHub创建Issue寻求帮助

---

**祝配置顺利！** 🚀

---

**文档版本**: 1.0  
**最后更新**: 2026年2月1日  
**项目**: TalentFlow v2.0.0
