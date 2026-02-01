
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants Table (企业租户表)
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null, -- e.g., 'tech_corp'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plan_level text default 'free' -- free, pro, enterprise
);

-- 2. Departments Table (部门与访问控制表)
-- Stores department-level access passwords (hashed) for the "Manager Portal"
create table departments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  name text not null,
  access_password_hash text not null, -- Encrypted password for department login
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(tenant_id, name)
);

-- 3. Employees Table (员工档案表)
create table employees (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  department_id uuid references departments(id), -- Optional link
  
  name text not null,
  role text not null,
  department_name text not null, -- Denormalized for easier querying
  avatar_url text,
  
  -- 0=Low, 1=Medium, 2=High
  performance_level smallint default 1, 
  potential_level smallint default 1,
  
  tenure numeric(4,1) default 0, -- Years
  flight_risk text check (flight_risk in ('Low', 'Medium', 'High')) default 'Low',
  
  last_review_date date,
  
  -- Arrays stored as JSONB
  key_strengths jsonb default '[]'::jsonb,
  development_needs jsonb default '[]'::jsonb,
  
  -- Succession Planning
  succession_status text check (succession_status in ('Ready-Now', 'Ready-Future', 'None')) default 'None',
  target_role text,
  career_aspiration text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Action Plans (行动计划表)
create table action_plans (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete cascade not null,
  category text not null,
  action text not null,
  owner text not null,
  deadline date,
  status text check (status in ('Pending', 'In Progress', 'Done')) default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_employees_tenant on employees(tenant_id);
create index idx_employees_dept on employees(tenant_id, department_name);

-- RLS Policies (Row Level Security) - 安全核心
-- 启用 RLS
alter table employees enable row level security;

-- 策略示例：允许拥有 Tenant ID 的用户读取该 Tenant 下的所有员工
-- (实际生产中需要配合 Supabase Auth 的 JWT Claims 进行更细粒度的控制)
create policy "Tenant Access" on employees
  for select
  using ( tenant_id::text = auth.jwt() ->> 'tenant_id' );

