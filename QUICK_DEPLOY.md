# 🚀 TalentFlow 快速部署指令

## 5分钟部署到Vercel

---

## 步骤1️⃣: 访问Vercel

🔗 打开浏览器，访问：**https://vercel.com**

点击 **"Sign Up"** 或 **"Log In"** → 选择 **"Continue with GitHub"**

---

## 步骤2️⃣: 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 找到 **`brandon-zhanghaodong/TalentFlow`**
3. 点击 **"Import"**

---

## 步骤3️⃣: 添加环境变量

在 **"Environment Variables"** 部分添加：

### 必需变量（至少添加这个）

```
GEMINI_API_KEY
AIzaSyBw-G4vRpIlVDdFf0_bQjsXuujPMSzT5Co
```

### 推荐变量（如果有Supabase）

```
NEXT_PUBLIC_SUPABASE_URL
https://your-project.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
your_anon_key
```

```
SUPABASE_SERVICE_ROLE_KEY
your_service_role_key
```

**提示**: 每个变量都要选择 **Production, Preview, Development** 三个环境！

---

## 步骤4️⃣: 部署

点击 **"Deploy"** 按钮，等待1-3分钟

---

## 步骤5️⃣: 访问网站

部署完成后，点击 **"Visit"** 或复制URL访问您的网站！

---

## ✅ 完成！

您的TalentFlow现在已经是永久网站了！

**自动生成的域名**: `https://talent-flow-xxx.vercel.app`

---

## 📚 需要详细指南？

查看完整文档：
- **VERCEL_DEPLOYMENT_GUIDE.md** - 详细部署步骤
- **ENV_VARIABLES_CHECKLIST.md** - 环境变量完整清单

---

## 🆘 遇到问题？

1. 检查环境变量是否正确添加
2. 查看部署日志中的错误信息
3. 参考 **VERCEL_DEPLOYMENT_GUIDE.md** 故障排查部分

---

**祝部署顺利！** 🎉
