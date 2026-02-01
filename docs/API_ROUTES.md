# TalentScout AI - API Routes Documentation

## Overview

This document outlines the backend API routes for TalentScout AI. These routes should be implemented as serverless functions or API endpoints depending on your deployment platform.

## Architecture

```
Frontend (React + Vite)
    ↓
API Routes (Serverless Functions)
    ↓
Supabase (PostgreSQL + Auth + Storage)
    ↓
External Services (Stripe, OpenAI, etc.)
```

## Authentication

All API routes (except public ones) should verify authentication using JWT tokens from Supabase Auth or custom session management.

```typescript
// Example middleware
const authenticateRequest = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: user, error } = await supabase.auth.getUser(token);
  if (error) throw new Error('Unauthorized');
  return user;
};
```

---

## API Endpoints

### 1. Tenant Management

#### `POST /api/tenants`
Create a new tenant

**Request:**
```json
{
  "name": "TechFlow Innovations",
  "slug": "tech_corp",
  "plan_level": "free"
}
```

**Response:**
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "name": "TechFlow Innovations",
    "slug": "tech_corp",
    "plan_level": "free",
    "created_at": "2026-02-01T00:00:00Z"
  }
}
```

#### `GET /api/tenants/:slug`
Get tenant information

**Response:**
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "name": "TechFlow Innovations",
    "slug": "tech_corp",
    "plan_level": "pro",
    "subscription_status": "active",
    "max_employees": 200,
    "max_departments": 20
  }
}
```

#### `PATCH /api/tenants/:id`
Update tenant information

**Request:**
```json
{
  "plan_level": "pro",
  "max_employees": 200
}
```

---

### 2. Employee Management

#### `GET /api/employees?tenant_id=:tenantId`
Get all employees for a tenant

**Query Parameters:**
- `tenant_id` (required): Tenant UUID
- `department` (optional): Filter by department
- `performance_level` (optional): Filter by performance level
- `potential_level` (optional): Filter by potential level

**Response:**
```json
{
  "success": true,
  "employees": [
    {
      "id": "uuid",
      "name": "张三",
      "role": "高级工程师",
      "department": "研发部",
      "performance_level": 2,
      "potential_level": 2,
      "tenure": 3.5,
      "flight_risk": "Low"
    }
  ],
  "total": 50
}
```

#### `POST /api/employees`
Create a new employee

**Request:**
```json
{
  "tenant_id": "uuid",
  "name": "李四",
  "role": "产品经理",
  "department_name": "产品部",
  "email": "lisi@example.com",
  "performance_level": 1,
  "potential_level": 2
}
```

#### `PATCH /api/employees/:id`
Update employee information

**Request:**
```json
{
  "performance_level": 2,
  "potential_level": 2,
  "key_strengths": ["战略思维", "团队协作"],
  "development_needs": ["技术深度"]
}
```

#### `DELETE /api/employees/:id`
Delete an employee

---

### 3. Department Management

#### `GET /api/departments?tenant_id=:tenantId`
Get all departments for a tenant

#### `POST /api/departments`
Create a new department

**Request:**
```json
{
  "tenant_id": "uuid",
  "name": "产品部",
  "access_password": "123456",
  "manager_name": "李明",
  "manager_email": "liming@example.com"
}
```

#### `POST /api/departments/verify`
Verify department access password

**Request:**
```json
{
  "tenant_id": "uuid",
  "department_name": "产品部",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true
}
```

---

### 4. Action Plans

#### `GET /api/action-plans?tenant_id=:tenantId`
Get all action plans

**Query Parameters:**
- `tenant_id` (required)
- `employee_id` (optional)
- `status` (optional): pending, in_progress, done
- `category` (optional)

#### `POST /api/action-plans`
Create an action plan

**Request:**
```json
{
  "tenant_id": "uuid",
  "employee_id": "uuid",
  "category": "HighPotential",
  "action": "安排领导力培训",
  "description": "详细描述...",
  "owner": "HR BP",
  "deadline": "2026-06-30",
  "priority": "High"
}
```

#### `PATCH /api/action-plans/:id`
Update action plan

**Request:**
```json
{
  "status": "In Progress",
  "progress_percentage": 50
}
```

---

### 5. Voice Transcription

#### `POST /api/voice/upload`
Upload audio file for transcription

**Request:** `multipart/form-data`
- `file`: Audio file (mp3, wav, webm, mp4)
- `tenant_id`: Tenant UUID
- `employee_id`: Employee UUID (optional)
- `created_by`: User name (optional)

**Response:**
```json
{
  "success": true,
  "transcription_id": "uuid",
  "status": "processing"
}
```

#### `GET /api/voice/transcriptions/:id`
Get transcription result

**Response:**
```json
{
  "success": true,
  "transcription": {
    "id": "uuid",
    "audio_file_url": "https://...",
    "transcription_text": "转录文本...",
    "transcription_status": "completed",
    "confidence_score": 0.95,
    "sentiment_analysis": {
      "overall": "positive",
      "score": 0.75
    },
    "key_topics": ["职业发展", "薪资"],
    "action_items": ["安排面谈"]
  }
}
```

#### `GET /api/voice/transcriptions?tenant_id=:tenantId`
Get all transcriptions for a tenant

---

### 6. Payment & Subscription

#### `POST /api/payments/create-intent`
Create Stripe payment intent

**Request:**
```json
{
  "tenant_id": "uuid",
  "plan_id": "pro",
  "billing_period": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

#### `POST /api/payments/confirm`
Confirm payment and activate subscription

**Request:**
```json
{
  "tenant_id": "uuid",
  "payment_intent_id": "pi_xxx",
  "plan_id": "pro"
}
```

#### `POST /api/payments/webhook`
Stripe webhook endpoint (for Stripe events)

**Headers:**
- `stripe-signature`: Webhook signature

#### `GET /api/payments/transactions?tenant_id=:tenantId`
Get payment transaction history

#### `POST /api/subscriptions/cancel`
Cancel subscription

**Request:**
```json
{
  "tenant_id": "uuid",
  "subscription_id": "sub_xxx"
}
```

---

### 7. AI Chat

#### `POST /api/ai/chat`
Send message to AI assistant

**Request:**
```json
{
  "tenant_id": "uuid",
  "session_id": "uuid",
  "message": "帮我分析研发部的人才结构",
  "user_role": "HR_BP",
  "context_filters": {
    "department": "研发部"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "研发部目前共有3名员工...",
  "message_id": "uuid"
}
```

#### `GET /api/ai/chat-history?session_id=:sessionId`
Get chat history for a session

---

### 8. Analytics

#### `GET /api/analytics/performance-distribution?tenant_id=:tenantId`
Get performance distribution data

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "department_name": "研发部",
      "performance_level": 2,
      "potential_level": 2,
      "employee_count": 5
    }
  ]
}
```

#### `GET /api/analytics/flight-risk?tenant_id=:tenantId`
Get flight risk summary

#### `GET /api/analytics/succession-pipeline?tenant_id=:tenantId`
Get succession planning pipeline data

#### `GET /api/analytics/dashboard-stats?tenant_id=:tenantId`
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_employees": 50,
    "high_potentials": 12,
    "flight_risks": 5,
    "avg_tenure": 3.8,
    "succession_ready_now": 8,
    "pending_action_plans": 15
  }
}
```

---

### 9. Audit Logs

#### `GET /api/audit-logs?tenant_id=:tenantId`
Get audit logs

**Query Parameters:**
- `tenant_id` (required)
- `entity_type` (optional): employee, action_plan, etc.
- `action_type` (optional): INSERT, UPDATE, DELETE
- `start_date` (optional)
- `end_date` (optional)
- `limit` (optional, default: 100)

---

### 10. Utility Endpoints

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T00:00:00Z",
  "version": "1.0.0"
}
```

#### `GET /api/config`
Get public configuration

**Response:**
```json
{
  "features": {
    "voice_transcription": true,
    "stripe_payments": true
  },
  "limits": {
    "max_file_size": 10485760,
    "max_audio_duration": 3600
  }
}
```

---

## Implementation Notes

### Deployment Options

1. **Vercel Serverless Functions**
   - Create `api/` folder in project root
   - Each file becomes an endpoint
   - Example: `api/employees/index.ts` → `/api/employees`

2. **Netlify Functions**
   - Create `netlify/functions/` folder
   - Similar structure to Vercel

3. **Express.js Backend**
   - Traditional Node.js server
   - Deploy to any hosting provider

4. **Supabase Edge Functions**
   - Deploy functions directly to Supabase
   - Deno runtime

### Security Best Practices

1. **Authentication**: Always verify JWT tokens
2. **Authorization**: Check tenant_id matches authenticated user
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Input Validation**: Validate and sanitize all inputs
5. **CORS**: Configure CORS properly for your frontend domain
6. **Secrets**: Never expose API keys in frontend code

### Error Handling

All endpoints should return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Employee name is required",
    "details": {}
  }
}
```

### Pagination

For list endpoints, use cursor-based pagination:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "has_more": true,
    "next_cursor": "uuid"
  }
}
```

---

## Next Steps

1. Choose your deployment platform
2. Implement API routes following this specification
3. Set up environment variables
4. Configure CORS and security headers
5. Test all endpoints
6. Set up monitoring and logging
