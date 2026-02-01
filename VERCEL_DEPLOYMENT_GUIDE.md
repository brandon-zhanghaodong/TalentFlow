# TalentFlow - Vercel部署指南

## 🚀 快速部署步骤

按照以下步骤将TalentFlow部署为永久网站：

---

## 第一步：登录Vercel

1. 访问 **https://vercel.com**
2. 点击右上角 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**
4. 授权Vercel访问您的GitHub账号

---

## 第二步：导入项目

1. 登录后，点击 **"Add New..."** → **"Project"**
2. 在 "Import Git Repository" 页面，找到 **`brandon-zhanghaodong/TalentFlow`**
3. 如果没有看到，点击 **"Adjust GitHub App Permissions"** 授权访问该仓库
4. 找到后，点击 **"Import"**

---

## 第三步：配置项目

Vercel会自动检测到这是一个Vite项目，并自动配置：

### 自动配置（无需修改）
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 需要确认的设置
- **Root Directory**: `.` (保持默认)
- **Node.js Version**: 18.x 或更高

---

## 第四步：配置环境变量 ⚠️ 重要

在部署前，**必须**添加以下环境变量：

### 必需的环境变量

点击 **"Environment Variables"** 部分，添加以下变量：

#### 1. Gemini AI（必需）
```
Name: GEMINI_API_KEY
Value: AIzaSyBw-G4vRpIlVDdFf0_bQjsXuujPMSzT5Co
```

#### 2. Supabase（推荐）
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your_supabase_anon_key
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key
```

#### 3. OpenAI（可选 - 用于语音转录）
```
Name: OPENAI_API_KEY
Value: 您的有效OpenAI密钥
```

#### 4. Stripe（可选 - 用于支付功能）
```
Name: STRIPE_SECRET_KEY
Value: sk_test_your_stripe_key
```

```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_your_stripe_key
```

### 添加环境变量的步骤

1. 在项目配置页面找到 **"Environment Variables"** 部分
2. 点击 **"Add"** 或输入框
3. 输入 **Name**（变量名）
4. 输入 **Value**（变量值）
5. 选择环境：**Production**, **Preview**, **Development**（全选）
6. 点击 **"Add"** 确认
7. 重复以上步骤添加所有变量

---

## 第五步：部署

1. 确认所有配置正确
2. 点击 **"Deploy"** 按钮
3. 等待部署完成（通常需要1-3分钟）

### 部署过程

您会看到以下步骤：
- ✅ Building...（构建中）
- ✅ Deploying...（部署中）
- ✅ Ready!（完成）

---

## 第六步：访问网站

部署成功后，您会看到：

### 自动生成的域名
```
https://talent-flow-xxx.vercel.app
```

### 访问您的网站
1. 点击 **"Visit"** 按钮
2. 或复制URL在浏览器中打开

---

## 🎉 恭喜！网站已上线

您的TalentFlow现在已经是一个永久网站了！

### 网站特性
- ✅ **永久访问** - 24/7在线
- ✅ **自动HTTPS** - 安全加密
- ✅ **全球CDN** - 快速访问
- ✅ **自动部署** - 每次push自动更新

---

## 📋 部署后检查清单

### 立即检查

- [ ] 网站可以正常访问
- [ ] 页面标题显示正确
- [ ] UI界面加载正常
- [ ] Gemini AI对话功能可用
- [ ] 没有控制台错误

### 如果配置了Supabase

- [ ] 数据库连接成功
- [ ] 可以查看员工列表
- [ ] 可以创建/编辑员工
- [ ] 九宫格显示正常

### 如果配置了OpenAI

- [ ] 语音录制功能可用
- [ ] 语音转录正常工作

### 如果配置了Stripe

- [ ] 支付页面加载正常
- [ ] 可以创建支付意图

---

## 🔧 常见问题

### Q1: 部署失败怎么办？

**检查构建日志**：
1. 在Vercel项目页面点击失败的部署
2. 查看 "Build Logs"
3. 找到错误信息

**常见错误**：
- 环境变量缺失 → 添加必需的环境变量
- 构建命令错误 → 确认使用 `pnpm build`
- 依赖安装失败 → 检查package.json

### Q2: 网站显示空白页面？

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误
3. 通常是环境变量未配置导致

### Q3: 如何更新网站？

**自动更新**：
- 只需 `git push` 到main分支
- Vercel会自动检测并重新部署
- 无需手动操作

**手动重新部署**：
1. 进入Vercel项目页面
2. 点击 "Deployments" 标签
3. 点击最新部署右侧的 "..." 菜单
4. 选择 "Redeploy"

### Q4: 如何绑定自定义域名？

1. 在Vercel项目页面点击 **"Settings"**
2. 点击 **"Domains"**
3. 输入您的域名（如 `talentflow.com`）
4. 按照提示配置DNS记录
5. 等待DNS生效（通常几分钟到几小时）

### Q5: 如何查看访问日志？

1. 在Vercel项目页面点击 **"Analytics"**
2. 查看访问量、地理位置等数据
3. 升级到Pro计划可获得更详细的分析

---

## 🔐 安全建议

### 环境变量安全

- ✅ **永远不要**将API密钥提交到Git
- ✅ 使用Vercel环境变量管理敏感信息
- ✅ 定期轮换API密钥
- ✅ 为不同环境使用不同的密钥

### 生产环境配置

1. **Supabase**
   - 使用生产项目（不是测试项目）
   - 启用Row Level Security
   - 配置适当的RLS策略

2. **OpenAI**
   - 设置使用限制
   - 监控API使用量
   - 考虑添加限流

3. **Stripe**
   - 使用生产密钥（不是测试密钥）
   - 配置Webhook
   - 测试支付流程

---

## 📊 监控和维护

### 推荐工具

1. **Vercel Analytics**
   - 内置分析工具
   - 查看访问量和性能

2. **Sentry**（可选）
   - 错误追踪
   - 性能监控
   - 用户反馈

3. **Google Analytics**（可选）
   - 用户行为分析
   - 转化跟踪

### 定期维护

- [ ] 每周检查部署状态
- [ ] 每月检查依赖更新
- [ ] 每季度审查安全设置
- [ ] 定期备份数据库

---

## 🎯 优化建议

### 性能优化

1. **启用Vercel Analytics**
   - 监控Core Web Vitals
   - 识别性能瓶颈

2. **图片优化**
   - 使用WebP格式
   - 配置适当的尺寸
   - 启用懒加载

3. **代码分割**
   - Vite自动处理
   - 检查bundle大小

### SEO优化

1. **添加meta标签**
   - 在index.html中添加描述
   - 配置Open Graph标签
   - 添加favicon

2. **配置robots.txt**
   - 允许搜索引擎索引
   - 排除敏感路径

3. **添加sitemap.xml**
   - 帮助搜索引擎发现页面
   - 提高索引效率

---

## 📞 获取帮助

### Vercel支持

- **文档**: https://vercel.com/docs
- **社区**: https://github.com/vercel/vercel/discussions
- **支持**: support@vercel.com

### TalentFlow支持

- **GitHub Issues**: https://github.com/brandon-zhanghaodong/TalentFlow/issues
- **文档**: 查看项目docs/目录
- **测试报告**: TEST_REPORT.md

---

## 🎉 下一步

网站部署成功后，您可以：

1. **分享链接**
   - 将Vercel URL分享给团队
   - 添加到简历或作品集

2. **配置自定义域名**
   - 使用自己的域名
   - 提升品牌形象

3. **完善功能**
   - 配置Supabase数据库
   - 启用语音转录
   - 集成支付功能

4. **监控和优化**
   - 查看访问数据
   - 优化性能
   - 收集用户反馈

---

## 📋 环境变量快速参考

复制以下内容，替换实际值后在Vercel中添加：

```bash
# 必需
GEMINI_API_KEY=AIzaSyBw-G4vRpIlVDdFf0_bQjsXuujPMSzT5Co

# Supabase（推荐）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI（可选）
OPENAI_API_KEY=your_valid_openai_key

# Stripe（可选）
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## ✅ 完成标志

当您看到以下内容时，说明部署成功：

1. ✅ Vercel显示 "Ready" 状态
2. ✅ 可以通过URL访问网站
3. ✅ 页面正常加载，无错误
4. ✅ AI对话功能可用
5. ✅ 所有组件正常显示

---

**部署愉快！** 🚀

如有任何问题，请参考本指南或查看项目文档。

---

**文档版本**: 1.0  
**最后更新**: 2026年2月1日  
**项目**: TalentFlow v2.0.0
