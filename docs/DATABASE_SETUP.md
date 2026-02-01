# TalentScout AI - Database Setup Guide

## Overview

This guide will help you set up the complete database infrastructure for TalentScout AI using Supabase (PostgreSQL).

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Basic understanding of SQL and PostgreSQL
- Access to Supabase SQL Editor

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: TalentScout AI
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (or Pro for production)
5. Wait for project to be provisioned (~2 minutes)

---

## Step 2: Configure Database

### 2.1 Get Connection Details

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (for client-side)
   - **service_role key**: `eyJhbGc...` (for server-side, keep secret!)

### 2.2 Update Environment Variables

Update your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 3: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for first-time setup)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `db/schema-enhanced.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for execution to complete
7. Verify no errors in the output

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Verify Installation

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- action_plans
- ai_chat_history
- audit_logs
- departments
- employees
- payment_transactions
- tenants
- voice_transcriptions

---

## Step 4: Seed Initial Data (Optional)

### For Development/Testing

1. Open SQL Editor
2. Copy content from `db/seed-data.sql`
3. Paste and run
4. Verify data insertion:

```sql
SELECT 
  'Tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees;
```

### For Production

**DO NOT** run seed data in production. Instead:
1. Create tenants through the application UI
2. Let users create their own departments and employees
3. Use the admin interface for initial setup

---

## Step 5: Configure Row Level Security (RLS)

RLS is already configured in the schema, but verify it's working:

### Test RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Important RLS Notes

1. **Development**: RLS policies are permissive for testing
2. **Production**: Update policies to use proper JWT claims
3. **Service Role**: Bypasses RLS (use carefully!)

---

## Step 6: Set Up Storage (for Audio Files)

### Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Bucket name: `audio-files`
4. Set to **Private** (requires authentication)
5. Click **Create Bucket**

### Configure Storage Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

-- Allow users to read their tenant's files
CREATE POLICY "Allow tenant file access"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files');
```

### Update Environment Variables

```bash
SUPABASE_STORAGE_BUCKET=audio-files
```

---

## Step 7: Configure Authentication (Optional)

If you want to use Supabase Auth instead of custom authentication:

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates
4. Set redirect URLs

### Enable OAuth Providers (Optional)

- Google
- GitHub
- Microsoft
- etc.

### Update Code

Replace custom auth logic with Supabase Auth:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Logout
await supabase.auth.signOut();
```

---

## Step 8: Database Optimization

### Create Additional Indexes (if needed)

```sql
-- For frequently queried fields
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_action_plans_owner ON action_plans(owner);
```

### Enable Real-time (Optional)

For real-time updates in the UI:

1. Go to **Database** → **Replication**
2. Enable replication for tables:
   - employees
   - action_plans
   - ai_chat_history

3. In your frontend:

```typescript
// Subscribe to changes
const subscription = supabase
  .channel('employees')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'employees' },
    (payload) => {
      console.log('Change received!', payload);
      // Update UI
    }
  )
  .subscribe();
```

---

## Step 9: Backup and Recovery

### Automatic Backups

- **Free Tier**: No automatic backups
- **Pro Tier**: Daily backups, 7-day retention
- **Enterprise**: Custom backup schedule

### Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or using pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore from Backup

```bash
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## Step 10: Monitoring and Maintenance

### Database Health Checks

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### Set Up Alerts

In Supabase dashboard:
1. Go to **Settings** → **Alerts**
2. Configure alerts for:
   - Database CPU usage > 80%
   - Storage usage > 80%
   - Connection count > 80%

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Problem**: Cannot connect to database

**Solution**:
- Check if project is paused (free tier pauses after inactivity)
- Verify connection string and credentials
- Check firewall/network settings

#### 2. RLS Blocking Queries

**Problem**: Queries return empty results

**Solution**:
- Use service_role key for server-side operations
- Check RLS policies are correctly configured
- Verify JWT claims match policy conditions

#### 3. Migration Errors

**Problem**: Schema migration fails

**Solution**:
- Check for syntax errors in SQL
- Ensure extensions are installed
- Run migrations in correct order
- Check for conflicting table/column names

#### 4. Storage Upload Fails

**Problem**: Cannot upload files to storage

**Solution**:
- Verify storage bucket exists
- Check storage policies
- Ensure file size is within limits
- Verify authentication token

---

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Update RLS policies for production
- [ ] Enable SSL/TLS for all connections
- [ ] Rotate API keys regularly
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Review and test all security policies
- [ ] Enable audit logging
- [ ] Set up rate limiting
- [ ] Configure CORS properly

---

## Performance Optimization

### Indexing Strategy

```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM employees 
WHERE tenant_id = 'xxx' AND department_name = 'xxx';

-- Create covering index if needed
CREATE INDEX idx_employees_tenant_dept_perf 
ON employees(tenant_id, department_name, performance_level, potential_level);
```

### Connection Pooling

For production, use connection pooling:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
    },
    global: {
      headers: { 'x-application-name': 'talentscout-ai' },
    },
  }
);
```

---

## Next Steps

1. ✅ Database schema created
2. ✅ Initial data seeded (optional)
3. ✅ Storage configured
4. ⬜ Set up authentication
5. ⬜ Configure real-time subscriptions
6. ⬜ Implement API routes
7. ⬜ Test all database operations
8. ⬜ Set up monitoring
9. ⬜ Configure backups
10. ⬜ Deploy to production

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Database Performance Tips](https://supabase.com/docs/guides/database/performance)

---

## Support

If you encounter issues:

1. Check Supabase status page
2. Review Supabase logs in dashboard
3. Search Supabase community forum
4. Contact Supabase support (Pro/Enterprise)
5. Open an issue in project repository
