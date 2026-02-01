-- ========================================
-- TalentScout AI - Seed Data
-- Description: Sample data for development and testing
-- ========================================

-- ========================================
-- 1. TENANTS
-- ========================================
INSERT INTO tenants (id, name, slug, plan_level, max_employees, max_departments, stripe_customer_id, subscription_status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'TechFlow Innovations', 'tech_corp', 'pro', 200, 20, 'cus_test_techflow', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Retail Group', 'retail_grp', 'free', 50, 10, NULL, 'inactive')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  plan_level = EXCLUDED.plan_level,
  max_employees = EXCLUDED.max_employees,
  max_departments = EXCLUDED.max_departments;

-- ========================================
-- 2. DEPARTMENTS (TechFlow Innovations)
-- ========================================
INSERT INTO departments (id, tenant_id, name, access_password_hash, manager_name, manager_email, description, headcount_target)
VALUES 
  ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '产品部', '123456', '李明', 'liming@techflow.com', '负责产品规划与设计', 15),
  ('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '研发部', '123456', '王强', 'wangqiang@techflow.com', '技术研发与工程实施', 30),
  ('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '销售部', '123456', '张伟', 'zhangwei@techflow.com', '市场拓展与客户关系', 20),
  ('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '法务部', '123456', '刘芳', 'liufang@techflow.com', '法律合规与风险管理', 5),
  ('d5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '管理层', '123456', '陈总', 'ceo@techflow.com', '公司高级管理团队', 8),
  ('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '运营部', '123456', '赵敏', 'zhaomin@techflow.com', '日常运营与流程优化', 12)
ON CONFLICT (tenant_id, name) DO UPDATE SET
  manager_name = EXCLUDED.manager_name,
  manager_email = EXCLUDED.manager_email,
  description = EXCLUDED.description;

-- ========================================
-- 3. DEPARTMENTS (Retail Group)
-- ========================================
INSERT INTO departments (id, tenant_id, name, access_password_hash, manager_name, manager_email, description, headcount_target)
VALUES 
  ('d7777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', '区域运营部', '888888', '孙经理', 'sun@retailgrp.com', '区域门店运营管理', 25),
  ('d8888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '门店管理部', '888888', '周经理', 'zhou@retailgrp.com', '门店日常管理', 40)
ON CONFLICT (tenant_id, name) DO UPDATE SET
  manager_name = EXCLUDED.manager_name,
  manager_email = EXCLUDED.manager_email;

-- ========================================
-- 4. SAMPLE EMPLOYEES (TechFlow Innovations)
-- ========================================
INSERT INTO employees (
  tenant_id, department_id, name, role, department_name, email, employee_id,
  performance_level, potential_level, tenure, flight_risk,
  key_strengths, development_needs, succession_status, target_role, 
  career_aspiration, readiness_score, salary_band
) VALUES 
  -- 产品部
  ('11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '李明', '产品总监', '产品部', 'liming@techflow.com', 'EMP001',
   2, 2, 5.5, 'Low', 
   '["战略思维", "用户洞察", "团队领导"]', '["技术深度", "数据分析"]', 
   'Ready-Now', 'VP of Product', '希望在3年内成为产品VP，带领更大的产品团队', 8.5, 'L5'),
   
  ('11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '陈小雅', '高级产品经理', '产品部', 'chenxiaoya@techflow.com', 'EMP002',
   2, 1, 3.2, 'Low',
   '["需求分析", "原型设计", "沟通能力"]', '["数据驱动决策", "技术理解"]',
   'Ready-Future', '产品总监', '希望深化产品专业能力，未来成为产品总监', 7.0, 'L4'),
   
  -- 研发部
  ('11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', '王强', '技术总监', '研发部', 'wangqiang@techflow.com', 'EMP003',
   2, 2, 7.0, 'Low',
   '["架构设计", "技术创新", "团队管理"]', '["产品思维", "商业理解"]',
   'Ready-Now', 'CTO', '希望成为CTO，推动公司技术战略', 9.0, 'L6'),
   
  ('11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', '张三', '高级工程师', '研发部', 'zhangsan@techflow.com', 'EMP004',
   1, 2, 4.0, 'Medium',
   '["编码能力", "学习能力", "问题解决"]', '["系统设计", "团队协作"]',
   'Ready-Future', '技术专家', '希望成为技术领域的专家', 6.5, 'L4'),
   
  ('11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', '李四', '中级工程师', '研发部', 'lisi@techflow.com', 'EMP005',
   1, 1, 2.5, 'Low',
   '["执行力", "责任心"]', '["技术深度", "独立解决问题"]',
   'None', '', '希望提升技术能力，成为高级工程师', 5.0, 'L3'),
   
  -- 销售部
  ('11111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', '张伟', '销售总监', '销售部', 'zhangwei@techflow.com', 'EMP006',
   2, 1, 6.0, 'Low',
   '["客户关系", "谈判能力", "业绩达成"]', '["战略思维", "团队培养"]',
   'Ready-Future', 'VP of Sales', '希望扩大销售团队规模，成为销售VP', 7.5, 'L5'),
   
  ('11111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', '王芳', '高级销售', '销售部', 'wangfang@techflow.com', 'EMP007',
   2, 2, 3.5, 'High',
   '["业绩优秀", "客户维护", "快速学习"]', '["管理能力", "战略规划"]',
   'Ready-Now', '销售经理', '希望带领团队，成为销售管理者', 8.0, 'L4'),
   
  -- 法务部
  ('11111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', '刘芳', '法务总监', '法务部', 'liufang@techflow.com', 'EMP008',
   2, 1, 8.0, 'Low',
   '["合规管理", "风险控制", "专业能力"]', '["商业理解", "跨部门协作"]',
   'None', '', '希望继续深化法务专业能力', 7.0, 'L5'),
   
  -- 管理层
  ('11111111-1111-1111-1111-111111111111', 'd5555555-5555-5555-5555-555555555555', '陈总', 'CEO', '管理层', 'ceo@techflow.com', 'EMP009',
   2, 2, 10.0, 'Low',
   '["战略领导", "商业洞察", "决策能力"]', '["技术前沿", "国际化经验"]',
   'None', '', '带领公司实现IPO目标', 9.5, 'Executive'),
   
  ('11111111-1111-1111-1111-111111111111', 'd5555555-5555-5555-5555-555555555555', '林副总', 'COO', '管理层', 'coo@techflow.com', 'EMP010',
   2, 2, 8.5, 'Low',
   '["运营管理", "流程优化", "执行力"]', '["技术理解", "创新思维"]',
   'Ready-Now', 'CEO', '希望未来有机会担任CEO', 8.5, 'Executive'),
   
  -- 运营部
  ('11111111-1111-1111-1111-111111111111', 'd6666666-6666-6666-6666-666666666666', '赵敏', '运营总监', '运营部', 'zhaomin@techflow.com', 'EMP011',
   2, 2, 5.0, 'Medium',
   '["数据分析", "流程优化", "项目管理"]', '["战略思维", "技术能力"]',
   'Ready-Future', 'VP of Operations', '希望成为运营VP，推动公司运营数字化', 7.5, 'L5'),
   
  ('11111111-1111-1111-1111-111111111111', 'd6666666-6666-6666-6666-666666666666', '钱小明', '运营专员', '运营部', 'qianxiaoming@techflow.com', 'EMP012',
   1, 1, 1.5, 'Low',
   '["执行力", "学习能力"]', '["数据分析", "项目管理"]',
   'None', '', '希望成长为运营经理', 5.5, 'L2')
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. SAMPLE ACTION PLANS
-- ========================================
INSERT INTO action_plans (
  tenant_id, employee_id, category, action, description, owner, owner_email,
  deadline, status, priority, progress_percentage
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   (SELECT id FROM employees WHERE email = 'wangfang@techflow.com'),
   'Retention', '提供晋升机会', '王芳表现优秀但离职风险高，需要提供明确的晋升路径和加薪计划',
   '张伟', 'zhangwei@techflow.com', '2026-03-15', 'In Progress', 'Urgent', 30),
   
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM employees WHERE email = 'zhangsan@techflow.com'),
   'Development', '系统设计培训', '安排参加系统架构设计培训，提升技术深度',
   '王强', 'wangqiang@techflow.com', '2026-04-30', 'Pending', 'High', 0),
   
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM employees WHERE email = 'chenxiaoya@techflow.com'),
   'HighPotential', '数据分析能力培养', '安排数据分析课程和实战项目，提升数据驱动决策能力',
   '李明', 'liming@techflow.com', '2026-05-31', 'Pending', 'Medium', 0),
   
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM employees WHERE email = 'zhaomin@techflow.com'),
   'Retention', '职业发展规划', '赵敏有离职风险，需要进行深度职业发展沟通',
   'HR BP', 'hr@techflow.com', '2026-02-28', 'Pending', 'High', 0)
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. SAMPLE VOICE TRANSCRIPTIONS
-- ========================================
INSERT INTO voice_transcriptions (
  tenant_id, employee_id, audio_file_url, audio_duration_seconds,
  transcription_text, transcription_language, confidence_score,
  transcription_status, created_by, processed_at
) VALUES 
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM employees WHERE email = 'wangfang@techflow.com'),
   'https://storage.example.com/audio/interview_wangfang_2026.mp3', 1800,
   '在这次绩效面谈中，王芳表示对目前的工作内容很满意，但希望能有更多的管理机会。她提到最近收到了竞争对手的offer，薪资比现在高30%。她希望公司能够给予更明确的职业发展路径。',
   'zh-CN', 0.95, 'completed', 'HR BP', NOW()),
   
  ('11111111-1111-1111-1111-111111111111',
   (SELECT id FROM employees WHERE email = 'zhangsan@techflow.com'),
   'https://storage.example.com/audio/review_zhangsan_2026.mp3', 1200,
   '张三在技术能力上表现出色，但在团队协作方面还需要提升。他表示希望能够参与更多的架构设计工作，对系统设计很感兴趣。建议安排相关培训和导师辅导。',
   'zh-CN', 0.92, 'completed', '王强', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. SAMPLE AI CHAT HISTORY
-- ========================================
INSERT INTO ai_chat_history (
  tenant_id, session_id, user_role, user_department,
  message_type, message_content, context_filters
) VALUES 
  ('11111111-1111-1111-1111-111111111111', uuid_generate_v4(), 'HR_BP', NULL,
   'user', '帮我分析一下研发部的人才结构', '{"department": "研发部"}'),
   
  ('11111111-1111-1111-1111-111111111111', uuid_generate_v4(), 'HR_BP', NULL,
   'assistant', '研发部目前共有3名员工，包括1名技术总监（高绩效高潜力），1名高级工程师（中绩效高潜力），1名中级工程师（中绩效中潜力）。整体技术实力较强，但需要关注张三的离职风险。建议加强团队建设和职业发展规划。', '{"department": "研发部"}')
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. SAMPLE PAYMENT TRANSACTIONS
-- ========================================
INSERT INTO payment_transactions (
  tenant_id, stripe_payment_intent_id, stripe_charge_id,
  amount, currency, payment_status, plan_type, billing_period,
  payment_method, receipt_url
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'pi_test_123456', 'ch_test_123456',
   299.00, 'USD', 'succeeded', 'pro', 'monthly',
   'card', 'https://stripe.com/receipts/test_123456')
ON CONFLICT DO NOTHING;

-- ========================================
-- Verification
-- ========================================
SELECT 'Seed data inserted successfully' AS status;

-- Display summary
SELECT 
  'Tenants' as table_name, COUNT(*) as record_count FROM tenants
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees
UNION ALL
SELECT 'Action Plans', COUNT(*) FROM action_plans
UNION ALL
SELECT 'Voice Transcriptions', COUNT(*) FROM voice_transcriptions
UNION ALL
SELECT 'Payment Transactions', COUNT(*) FROM payment_transactions
UNION ALL
SELECT 'AI Chat History', COUNT(*) FROM ai_chat_history;
