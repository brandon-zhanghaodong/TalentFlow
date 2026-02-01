# TalentScout AI - Deployment Guide

## Overview

This guide covers deploying TalentScout AI to production, including frontend, backend, database, and third-party integrations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              (React + Vite + TypeScript)                     │
│                 Hosted on Vercel/Netlify                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─────────────────────────────────────────┐
                  │                                         │
         ┌────────▼────────┐                    ┌──────────▼─────────┐
         │   API Routes    │                    │   Supabase DB      │
         │  (Serverless)   │◄──────────────────►│   (PostgreSQL)     │
         └────────┬────────┘                    └────────────────────┘
                  │
                  ├──────────────┬──────────────┬──────────────┐
                  │              │              │              │
         ┌────────▼────┐  ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼─────┐
         │   Stripe    │  │   OpenAI   │ │  Gemini AI │ │  Storage │
         │  (Payment)  │  │ (Whisper)  │ │   (Chat)   │ │   (S3)   │
         └─────────────┘  └────────────┘ └────────────┘ └──────────┘
```

---

## Prerequisites

### Required Accounts
- [x] GitHub account (for code repository)
- [x] Vercel or Netlify account (for hosting)
- [x] Supabase account (for database)
- [x] Stripe account (for payments)
- [x] OpenAI account (for voice transcription)
- [x] Google AI Studio account (for Gemini API)

### Required Tools
- Node.js 18+ and pnpm
- Git
- Supabase CLI (optional)
- Stripe CLI (for webhook testing)

---

## Step 1: Prepare Code for Deployment

### 1.1 Update Configuration Files

**package.json** - Add build scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

**vite.config.ts** - Optimize for production:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'react-markdown']
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
```

### 1.2 Environment Variables

Create `.env.production`:
```bash
GEMINI_API_KEY=your_production_gemini_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_APP_URL=https://talentscout.yourdomain.com
NODE_ENV=production
```

### 1.3 Build and Test Locally

```bash
# Install dependencies
pnpm install

# Type check
pnpm type-check

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Step 2: Set Up Database (Supabase)

Follow the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide to:

1. Create Supabase project
2. Run database migrations
3. Configure Row Level Security
4. Set up storage buckets
5. Enable authentication (optional)

**Important**: Use production credentials, not development ones!

---

## Step 3: Deploy Frontend

### Option A: Vercel (Recommended)

#### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository

#### 3.2 Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

#### 3.3 Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
GEMINI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 3.4 Deploy

Click "Deploy" and wait for build to complete.

#### 3.5 Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

### Option B: Netlify

#### 3.1 Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to Git provider and select repository

#### 3.2 Configure Build Settings

- **Build command**: `pnpm build`
- **Publish directory**: `dist`
- **Node version**: 18

#### 3.3 Add Environment Variables

Site settings → Environment variables → Add variables

#### 3.4 Deploy

Click "Deploy site"

---

## Step 4: Deploy Backend API Routes

### Option A: Vercel Serverless Functions

#### 4.1 Create API Directory Structure

```
project-root/
├── api/
│   ├── employees/
│   │   └── index.ts
│   ├── action-plans/
│   │   └── index.ts
│   ├── voice/
│   │   ├── upload.ts
│   │   └── transcriptions.ts
│   ├── payments/
│   │   ├── create-intent.ts
│   │   ├── confirm.ts
│   │   └── webhook.ts
│   └── ai/
│       └── chat.ts
├── src/
└── package.json
```

#### 4.2 Example API Route

**api/employees/index.ts**:
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { tenant_id } = req.query;

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', tenant_id);

      if (error) throw error;

      return res.status(200).json({ success: true, employees: data });
    }

    if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('employees')
        .insert([req.body])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, employee: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

#### 4.3 Add Server-Side Environment Variables

In Vercel:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
OPENAI_API_KEY=sk-xxx
```

### Option B: Netlify Functions

Similar structure in `netlify/functions/` directory.

### Option C: Separate Backend (Express.js)

Deploy to Railway, Render, or Fly.io:

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import employeesRouter from './routes/employees';
import paymentsRouter from './routes/payments';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeesRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Step 5: Configure Third-Party Services

### 5.1 Stripe Setup

#### Create Products and Prices

1. Go to Stripe Dashboard → Products
2. Create products:
   - **Pro Plan - Monthly**: $299/month
   - **Pro Plan - Yearly**: $2,990/year
   - **Enterprise Plan - Monthly**: $999/month
   - **Enterprise Plan - Yearly**: $9,990/year

3. Copy Price IDs and update `paymentService.ts`:
```typescript
stripePriceIdMonthly: 'price_xxx',
stripePriceIdYearly: 'price_yyy'
```

#### Configure Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-app.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to environment variables: `STRIPE_WEBHOOK_SECRET`

#### Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### 5.2 OpenAI Setup (Voice Transcription)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to environment variables: `OPENAI_API_KEY`
4. Update `voiceService.ts` to use real API:

```typescript
export const transcribeAudio = async (audioUrl: string) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', 'zh');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  const data = await response.json();
  return {
    success: true,
    text: data.text,
    confidence: 0.95
  };
};
```

### 5.3 Gemini AI Setup

1. Get API key from [ai.google.dev](https://ai.google.dev)
2. Add to environment variables: `GEMINI_API_KEY`
3. Already configured in `geminiService.ts`

---

## Step 6: Configure Storage

### Option A: Supabase Storage

Already configured in database setup. No additional steps needed.

### Option B: AWS S3

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const uploadToS3 = async (file: File, key: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: file.type
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};
```

---

## Step 7: Set Up Monitoring

### 7.1 Error Tracking (Sentry)

```bash
pnpm add @sentry/react @sentry/vite-plugin
```

**src/main.tsx**:
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 7.2 Analytics (Google Analytics)

```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 7.3 Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

---

## Step 8: Security Hardening

### 8.1 Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://js.stripe.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co https://api.stripe.com;">
```

### 8.2 Rate Limiting

Implement in API routes:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 8.3 HTTPS Only

Enforce HTTPS in production:
```typescript
if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
  return res.redirect('https://' + req.headers.host + req.url);
}
```

---

## Step 9: Performance Optimization

### 9.1 Enable Caching

**vercel.json**:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 9.2 Image Optimization

Use Vercel Image Optimization or Cloudinary.

### 9.3 Code Splitting

Already handled by Vite, but verify in build output.

---

## Step 10: Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] API routes working
- [ ] Database migrations applied
- [ ] Environment variables set correctly
- [ ] Stripe webhooks configured
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking enabled
- [ ] Analytics enabled
- [ ] Uptime monitoring configured
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Test all critical user flows
- [ ] Load testing completed
- [ ] Documentation updated

---

## Rollback Procedure

If deployment fails:

1. **Vercel**: Go to Deployments → Select previous deployment → Promote to Production
2. **Database**: Restore from backup (see DATABASE_SETUP.md)
3. **Environment Variables**: Revert to previous values
4. **Notify Users**: If downtime occurred

---

## Maintenance

### Regular Tasks

- **Daily**: Monitor error logs and uptime
- **Weekly**: Review database performance, check for slow queries
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Database backup verification, disaster recovery test

### Scaling Considerations

When to scale:
- Database CPU > 80% consistently
- API response time > 500ms
- Storage > 80% capacity
- User count exceeds plan limits

Scaling options:
- Upgrade Supabase plan
- Add read replicas
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries

---

## Support and Troubleshooting

### Common Issues

1. **Build fails**: Check Node version, dependencies
2. **API errors**: Verify environment variables, check logs
3. **Database connection fails**: Check Supabase project status
4. **Stripe webhooks not working**: Verify endpoint URL and secret

### Getting Help

- Check deployment logs
- Review Supabase logs
- Check Stripe dashboard for webhook delivery
- Contact support for respective services

---

## Next Steps

1. ✅ Deploy to production
2. ⬜ Set up CI/CD pipeline
3. ⬜ Configure staging environment
4. ⬜ Implement automated testing
5. ⬜ Set up monitoring dashboards
6. ⬜ Create runbook for common issues
7. ⬜ Train team on deployment process
8. ⬜ Schedule regular maintenance windows

Congratulations! Your TalentScout AI application is now live! 🎉
