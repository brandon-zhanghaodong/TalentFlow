-- ========================================
-- TalentScout AI - Enhanced Database Schema
-- Version: 2.0
-- ========================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. TENANTS TABLE (企业租户表)
-- ========================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_level TEXT DEFAULT 'free' CHECK (plan_level IN ('free', 'pro', 'enterprise')),
  
  -- Stripe Integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Limits based on plan
  max_employees INTEGER DEFAULT 50,
  max_departments INTEGER DEFAULT 10,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 2. DEPARTMENTS TABLE (部门与访问控制表)
-- ========================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  
  -- Access Control
  access_password_hash TEXT NOT NULL,
  manager_name TEXT,
  manager_email TEXT,
  
  -- Department Metadata
  description TEXT,
  budget NUMERIC(12, 2),
  headcount_target INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(tenant_id, name)
);

-- ========================================
-- 3. EMPLOYEES TABLE (员工档案表)
-- ========================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Basic Information
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  employee_id TEXT, -- Internal employee ID
  
  -- Performance & Potential (0=Low, 1=Medium, 2=High)
  performance_level SMALLINT DEFAULT 1 CHECK (performance_level IN (0, 1, 2)),
  potential_level SMALLINT DEFAULT 1 CHECK (potential_level IN (0, 1, 2)),
  
  -- Career Information
  tenure NUMERIC(4,1) DEFAULT 0,
  flight_risk TEXT DEFAULT 'Low' CHECK (flight_risk IN ('Low', 'Medium', 'High')),
  last_review_date DATE,
  next_review_date DATE,
  
  -- Competencies & Development
  key_strengths JSONB DEFAULT '[]'::jsonb,
  development_needs JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  training_history JSONB DEFAULT '[]'::jsonb,
  
  -- Succession Planning
  succession_status TEXT DEFAULT 'None' CHECK (succession_status IN ('Ready-Now', 'Ready-Future', 'None')),
  target_role TEXT,
  career_aspiration TEXT,
  readiness_score NUMERIC(3,1) DEFAULT 0.0 CHECK (readiness_score >= 0 AND readiness_score <= 10),
  
  -- Compensation (Optional, for HR use)
  salary_band TEXT,
  last_promotion_date DATE,
  
  -- AI Analysis Results
  ai_summary TEXT,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  last_ai_analysis_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 4. ACTION PLANS TABLE (行动计划表)
-- ========================================
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL CHECK (category IN ('HighPotential', 'Underperformer', 'Succession', 'General', 'Development', 'Retention')),
  action TEXT NOT NULL,
  description TEXT,
  owner TEXT NOT NULL,
  owner_email TEXT,
  
  deadline DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Done', 'Cancelled')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  
  -- Progress Tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 5. VOICE TRANSCRIPTIONS TABLE (语音转录记录)
-- ========================================
CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Audio File Information
  audio_file_url TEXT NOT NULL,
  audio_duration_seconds INTEGER,
  file_size_bytes BIGINT,
  
  -- Transcription Results
  transcription_text TEXT,
  transcription_language TEXT DEFAULT 'zh-CN',
  confidence_score NUMERIC(3,2),
  
  -- AI Analysis
  sentiment_analysis JSONB,
  key_topics JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  transcription_status TEXT DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  created_by TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 6. PAYMENT TRANSACTIONS TABLE (支付交易记录)
-- ========================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Stripe Information
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  
  -- Transaction Details
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Plan Information
  plan_type TEXT NOT NULL,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- Metadata
  payment_method TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 7. AUDIT LOGS TABLE (审计日志)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Action Information
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  -- User Information
  user_role TEXT,
  user_department TEXT,
  user_ip TEXT,
  
  -- Change Details
  old_values JSONB,
  new_values JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- 8. AI CHAT HISTORY TABLE (AI对话历史)
-- ========================================
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Session Information
  session_id UUID NOT NULL,
  user_role TEXT,
  user_department TEXT,
  
  -- Message Content
  message_type TEXT CHECK (message_type IN ('user', 'assistant', 'system')),
  message_content TEXT NOT NULL,
  
  -- Context
  context_employees JSONB DEFAULT '[]'::jsonb,
  context_filters JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Employees Indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(tenant_id, department_name);
CREATE INDEX IF NOT EXISTS idx_employees_performance ON employees(performance_level, potential_level);
CREATE INDEX IF NOT EXISTS idx_employees_succession ON employees(succession_status);
CREATE INDEX IF NOT EXISTS idx_employees_flight_risk ON employees(flight_risk);

-- Action Plans Indexes
CREATE INDEX IF NOT EXISTS idx_action_plans_tenant ON action_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_employee ON action_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_deadline ON action_plans(deadline);

-- Voice Transcriptions Indexes
CREATE INDEX IF NOT EXISTS idx_voice_tenant ON voice_transcriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_voice_employee ON voice_transcriptions(employee_id);
CREATE INDEX IF NOT EXISTS idx_voice_status ON voice_transcriptions(transcription_status);

-- Payment Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_payment_tenant ON payment_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_stripe ON payment_transactions(stripe_payment_intent_id);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- AI Chat History Indexes
CREATE INDEX IF NOT EXISTS idx_chat_session ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_tenant ON ai_chat_history(tenant_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Tenant Access Policy (基于JWT的tenant_id)
CREATE POLICY "Tenant Access - Employees" ON employees
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

CREATE POLICY "Tenant Access - Action Plans" ON action_plans
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

CREATE POLICY "Tenant Access - Voice Transcriptions" ON voice_transcriptions
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

CREATE POLICY "Tenant Access - Payment Transactions" ON payment_transactions
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

CREATE POLICY "Tenant Access - Audit Logs" ON audit_logs
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

CREATE POLICY "Tenant Access - AI Chat History" ON ai_chat_history
  FOR SELECT
  USING (tenant_id::text = COALESCE(auth.jwt() ->> 'tenant_id', tenant_id::text));

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at BEFORE UPDATE ON action_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log employee changes to audit_logs
CREATE OR REPLACE FUNCTION log_employee_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    tenant_id,
    action_type,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    NEW.tenant_id,
    TG_OP,
    'employee',
    NEW.id,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for employee audit logging
CREATE TRIGGER log_employee_changes_trigger
AFTER INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION log_employee_changes();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- View: Employee Performance Distribution
CREATE OR REPLACE VIEW v_performance_distribution AS
SELECT 
  tenant_id,
  department_name,
  performance_level,
  potential_level,
  COUNT(*) as employee_count
FROM employees
GROUP BY tenant_id, department_name, performance_level, potential_level;

-- View: Flight Risk Summary
CREATE OR REPLACE VIEW v_flight_risk_summary AS
SELECT 
  tenant_id,
  department_name,
  flight_risk,
  COUNT(*) as employee_count,
  AVG(tenure) as avg_tenure
FROM employees
GROUP BY tenant_id, department_name, flight_risk;

-- View: Succession Pipeline
CREATE OR REPLACE VIEW v_succession_pipeline AS
SELECT 
  tenant_id,
  target_role,
  succession_status,
  COUNT(*) as candidate_count,
  AVG(readiness_score) as avg_readiness
FROM employees
WHERE succession_status != 'None'
GROUP BY tenant_id, target_role, succession_status;

-- ========================================
-- SEED DATA (Optional - for testing)
-- ========================================

-- Insert default tenant for testing
INSERT INTO tenants (name, slug, plan_level, max_employees, max_departments)
VALUES 
  ('TechFlow Innovations', 'tech_corp', 'pro', 200, 20),
  ('Retail Group', 'retail_grp', 'free', 50, 10)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE tenants IS '企业租户表 - 存储多租户信息及订阅状态';
COMMENT ON TABLE departments IS '部门表 - 包含访问控制和部门元数据';
COMMENT ON TABLE employees IS '员工档案表 - 核心人才数据存储';
COMMENT ON TABLE action_plans IS '行动计划表 - 人才发展和改进计划';
COMMENT ON TABLE voice_transcriptions IS '语音转录表 - 存储面试和评估录音的转录结果';
COMMENT ON TABLE payment_transactions IS '支付交易表 - Stripe支付集成记录';
COMMENT ON TABLE audit_logs IS '审计日志表 - 记录所有关键操作';
COMMENT ON TABLE ai_chat_history IS 'AI对话历史表 - 存储用户与AI助手的交互记录';
