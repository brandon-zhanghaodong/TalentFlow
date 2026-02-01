/**
 * TalentScout AI - Enhanced Supabase Service
 * Comprehensive database service layer with full CRUD operations
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Employee, PerformanceLevel, PotentialLevel, ActionItem } from '../types';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan_level: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  max_employees: number;
  max_departments: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  tenant_id: string;
  name: string;
  manager_name?: string;
  manager_email?: string;
  description?: string;
  budget?: number;
  headcount_target?: number;
}

export interface VoiceTranscription {
  id: string;
  tenant_id: string;
  employee_id?: string;
  audio_file_url: string;
  audio_duration_seconds?: number;
  transcription_text?: string;
  transcription_language: string;
  confidence_score?: number;
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  sentiment_analysis?: any;
  key_topics?: string[];
  action_items?: string[];
  created_by?: string;
  created_at: string;
  processed_at?: string;
}

export interface PaymentTransaction {
  id: string;
  tenant_id: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  plan_type: string;
  billing_period?: 'monthly' | 'yearly';
  payment_method?: string;
  receipt_url?: string;
  failure_reason?: string;
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  tenant_id: string;
  session_id: string;
  user_role?: string;
  user_department?: string;
  message_type: 'user' | 'assistant' | 'system';
  message_content: string;
  context_employees?: any[];
  context_filters?: any;
  created_at: string;
}

// ========================================
// DATA MAPPERS
// ========================================

const mapEmployeeFromDB = (row: any): Employee => ({
  id: row.id,
  name: row.name,
  role: row.role,
  department: row.department_name,
  avatar: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`,
  performance: row.performance_level as PerformanceLevel,
  potential: row.potential_level as PotentialLevel,
  tenure: Number(row.tenure),
  flightRisk: row.flight_risk,
  lastReviewDate: row.last_review_date,
  keyStrengths: row.key_strengths || [],
  developmentNeeds: row.development_needs || [],
  successionStatus: row.succession_status || 'None',
  targetRole: row.target_role || '',
  careerAspiration: row.career_aspiration || ''
});

const mapEmployeeToDB = (e: Partial<Employee>) => {
  const payload: any = {};
  if (e.name !== undefined) payload.name = e.name;
  if (e.role !== undefined) payload.role = e.role;
  if (e.department !== undefined) payload.department_name = e.department;
  if (e.avatar !== undefined) payload.avatar_url = e.avatar;
  if (e.performance !== undefined) payload.performance_level = e.performance;
  if (e.potential !== undefined) payload.potential_level = e.potential;
  if (e.tenure !== undefined) payload.tenure = e.tenure;
  if (e.flightRisk !== undefined) payload.flight_risk = e.flightRisk;
  if (e.lastReviewDate !== undefined) payload.last_review_date = e.lastReviewDate;
  if (e.keyStrengths !== undefined) payload.key_strengths = e.keyStrengths;
  if (e.developmentNeeds !== undefined) payload.development_needs = e.developmentNeeds;
  if (e.successionStatus !== undefined) payload.succession_status = e.successionStatus;
  if (e.targetRole !== undefined) payload.target_role = e.targetRole;
  if (e.careerAspiration !== undefined) payload.career_aspiration = e.careerAspiration;
  payload.updated_at = new Date().toISOString();
  return payload;
};

const mapActionItemFromDB = (row: any): ActionItem => ({
  id: row.id,
  category: row.category,
  action: row.action,
  owner: row.owner,
  deadline: row.deadline,
  status: row.status
});

const mapActionItemToDB = (item: Partial<ActionItem>) => {
  const payload: any = {};
  if (item.category !== undefined) payload.category = item.category;
  if (item.action !== undefined) payload.action = item.action;
  if (item.owner !== undefined) payload.owner = item.owner;
  if (item.deadline !== undefined) payload.deadline = item.deadline;
  if (item.status !== undefined) payload.status = item.status;
  payload.updated_at = new Date().toISOString();
  return payload;
};

// ========================================
// TENANT OPERATIONS
// ========================================

export const getTenant = async (slug: string): Promise<Tenant | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning mock tenant');
    return null;
  }

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data;
};

export const createTenant = async (
  name: string,
  slug: string,
  planLevel: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<Tenant | null> => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert([{ name, slug, plan_level: planLevel }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tenant:', error);
    return null;
  }

  return data;
};

export const updateTenant = async (
  tenantId: string,
  updates: Partial<Tenant>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId);

  if (error) {
    console.error('Error updating tenant:', error);
    return false;
  }

  return true;
};

// ========================================
// DEPARTMENT OPERATIONS
// ========================================

export const getDepartments = async (tenantId: string): Promise<Department[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  return data || [];
};

export const createDepartment = async (
  tenantId: string,
  name: string,
  accessPassword: string,
  managerName?: string,
  managerEmail?: string
): Promise<Department | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('departments')
    .insert([{
      tenant_id: tenantId,
      name,
      access_password_hash: accessPassword, // In production, hash this!
      manager_name: managerName,
      manager_email: managerEmail
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating department:', error);
    return null;
  }

  return data;
};

export const verifyDepartmentPassword = async (
  tenantId: string,
  deptName: string,
  passwordInput: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { data, error } = await supabase
    .from('departments')
    .select('access_password_hash')
    .eq('tenant_id', tenantId)
    .eq('name', deptName)
    .single();

  if (error || !data) return false;

  // In production, use proper password hashing (bcrypt, argon2, etc.)
  return data.access_password_hash === passwordInput;
};

// ========================================
// EMPLOYEE OPERATIONS
// ========================================

export const fetchEmployees = async (tenantId: string): Promise<Employee[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return (data || []).map(mapEmployeeFromDB);
};

export const fetchEmployeesByDepartment = async (
  tenantId: string,
  departmentName: string
): Promise<Employee[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('department_name', departmentName)
    .order('name');

  if (error) {
    console.error('Error fetching employees by department:', error);
    return [];
  }

  return (data || []).map(mapEmployeeFromDB);
};

export const getEmployee = async (employeeId: string): Promise<Employee | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return mapEmployeeFromDB(data);
};

export const createEmployee = async (
  tenantId: string,
  employee: Partial<Employee>
): Promise<Employee | null> => {
  if (!isSupabaseConfigured()) return null;

  const dbEmployee = {
    ...mapEmployeeToDB(employee),
    tenant_id: tenantId
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([dbEmployee])
    .select()
    .single();

  if (error) {
    console.error('Error creating employee:', error);
    return null;
  }

  return mapEmployeeFromDB(data);
};

export const updateEmployee = async (
  employeeId: string,
  updates: Partial<Employee>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates = mapEmployeeToDB(updates);

  const { error } = await supabase
    .from('employees')
    .update(dbUpdates)
    .eq('id', employeeId);

  if (error) {
    console.error('Error updating employee:', error);
    return false;
  }

  return true;
};

export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }

  return true;
};

export const seedTenantData = async (
  tenantId: string,
  employees: Employee[]
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const rows = employees.map(e => ({
    ...mapEmployeeToDB(e),
    tenant_id: tenantId
  }));

  const { error } = await supabase
    .from('employees')
    .insert(rows);

  if (error) {
    console.error('Seed error:', error);
    return false;
  }

  return true;
};

// ========================================
// ACTION PLAN OPERATIONS
// ========================================

export const fetchActionPlans = async (tenantId: string): Promise<ActionItem[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('deadline');

  if (error) {
    console.error('Error fetching action plans:', error);
    return [];
  }

  return (data || []).map(mapActionItemFromDB);
};

export const createActionPlan = async (
  tenantId: string,
  actionPlan: Partial<ActionItem>,
  employeeId?: string
): Promise<ActionItem | null> => {
  if (!isSupabaseConfigured()) return null;

  const dbActionPlan = {
    ...mapActionItemToDB(actionPlan),
    tenant_id: tenantId,
    employee_id: employeeId
  };

  const { data, error } = await supabase
    .from('action_plans')
    .insert([dbActionPlan])
    .select()
    .single();

  if (error) {
    console.error('Error creating action plan:', error);
    return null;
  }

  return mapActionItemFromDB(data);
};

export const updateActionPlan = async (
  actionPlanId: string,
  updates: Partial<ActionItem>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const dbUpdates = mapActionItemToDB(updates);

  const { error } = await supabase
    .from('action_plans')
    .update(dbUpdates)
    .eq('id', actionPlanId);

  if (error) {
    console.error('Error updating action plan:', error);
    return false;
  }

  return true;
};

export const deleteActionPlan = async (actionPlanId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('action_plans')
    .delete()
    .eq('id', actionPlanId);

  if (error) {
    console.error('Error deleting action plan:', error);
    return false;
  }

  return true;
};

// ========================================
// VOICE TRANSCRIPTION OPERATIONS
// ========================================

export const createVoiceTranscription = async (
  tenantId: string,
  audioFileUrl: string,
  employeeId?: string,
  createdBy?: string
): Promise<VoiceTranscription | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('voice_transcriptions')
    .insert([{
      tenant_id: tenantId,
      employee_id: employeeId,
      audio_file_url: audioFileUrl,
      transcription_status: 'pending',
      transcription_language: 'zh-CN',
      created_by: createdBy
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating voice transcription:', error);
    return null;
  }

  return data;
};

export const updateVoiceTranscription = async (
  transcriptionId: string,
  updates: Partial<VoiceTranscription>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('voice_transcriptions')
    .update(updates)
    .eq('id', transcriptionId);

  if (error) {
    console.error('Error updating voice transcription:', error);
    return false;
  }

  return true;
};

export const fetchVoiceTranscriptions = async (
  tenantId: string,
  employeeId?: string
): Promise<VoiceTranscription[]> => {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('voice_transcriptions')
    .select('*')
    .eq('tenant_id', tenantId);

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching voice transcriptions:', error);
    return [];
  }

  return data || [];
};

// ========================================
// PAYMENT OPERATIONS
// ========================================

export const createPaymentTransaction = async (
  tenantId: string,
  amount: number,
  planType: string,
  billingPeriod: 'monthly' | 'yearly',
  stripePaymentIntentId?: string
): Promise<PaymentTransaction | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('payment_transactions')
    .insert([{
      tenant_id: tenantId,
      amount,
      currency: 'USD',
      plan_type: planType,
      billing_period: billingPeriod,
      stripe_payment_intent_id: stripePaymentIntentId,
      payment_status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating payment transaction:', error);
    return null;
  }

  return data;
};

export const updatePaymentTransaction = async (
  transactionId: string,
  updates: Partial<PaymentTransaction>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  const { error } = await supabase
    .from('payment_transactions')
    .update(updates)
    .eq('id', transactionId);

  if (error) {
    console.error('Error updating payment transaction:', error);
    return false;
  }

  return true;
};

export const fetchPaymentTransactions = async (
  tenantId: string
): Promise<PaymentTransaction[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment transactions:', error);
    return [];
  }

  return data || [];
};

// ========================================
// AI CHAT OPERATIONS
// ========================================

export const saveAIChatMessage = async (
  tenantId: string,
  sessionId: string,
  messageType: 'user' | 'assistant' | 'system',
  messageContent: string,
  userRole?: string,
  userDepartment?: string,
  contextFilters?: any
): Promise<AIChatMessage | null> => {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('ai_chat_history')
    .insert([{
      tenant_id: tenantId,
      session_id: sessionId,
      message_type: messageType,
      message_content: messageContent,
      user_role: userRole,
      user_department: userDepartment,
      context_filters: contextFilters
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving AI chat message:', error);
    return null;
  }

  return data;
};

export const fetchAIChatHistory = async (
  tenantId: string,
  sessionId: string
): Promise<AIChatMessage[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('ai_chat_history')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('session_id', sessionId)
    .order('created_at');

  if (error) {
    console.error('Error fetching AI chat history:', error);
    return [];
  }

  return data || [];
};

// ========================================
// ANALYTICS & REPORTS
// ========================================

export const getPerformanceDistribution = async (tenantId: string) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('v_performance_distribution')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Error fetching performance distribution:', error);
    return [];
  }

  return data || [];
};

export const getFlightRiskSummary = async (tenantId: string) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('v_flight_risk_summary')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Error fetching flight risk summary:', error);
    return [];
  }

  return data || [];
};

export const getSuccessionPipeline = async (tenantId: string) => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('v_succession_pipeline')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) {
    console.error('Error fetching succession pipeline:', error);
    return [];
  }

  return data || [];
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const checkTenantLimits = async (tenantId: string): Promise<{
  canAddEmployee: boolean;
  canAddDepartment: boolean;
  currentEmployeeCount: number;
  currentDepartmentCount: number;
  maxEmployees: number;
  maxDepartments: number;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      canAddEmployee: true,
      canAddDepartment: true,
      currentEmployeeCount: 0,
      currentDepartmentCount: 0,
      maxEmployees: 999,
      maxDepartments: 999
    };
  }

  const tenant = await getTenant(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const employees = await fetchEmployees(tenantId);
  const departments = await getDepartments(tenantId);

  return {
    canAddEmployee: employees.length < tenant.max_employees,
    canAddDepartment: departments.length < tenant.max_departments,
    currentEmployeeCount: employees.length,
    currentDepartmentCount: departments.length,
    maxEmployees: tenant.max_employees,
    maxDepartments: tenant.max_departments
  };
};

export { isSupabaseConfigured };
