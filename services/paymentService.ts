/**
 * TalentScout AI - Payment Service (Stripe Integration)
 * Handles subscription management and payment processing
 */

import {
  createPaymentTransaction,
  updatePaymentTransaction,
  updateTenant
} from './supabaseService-enhanced';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface PricingPlan {
  id: string;
  name: string;
  level: 'free' | 'pro' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  maxEmployees: number;
  maxDepartments: number;
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

// ========================================
// PRICING PLANS
// ========================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    level: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxEmployees: 50,
    maxDepartments: 5,
    features: [
      '最多50名员工',
      '最多5个部门',
      '基础九宫格分析',
      '员工档案管理',
      'AI对话助手（限量）'
    ]
  },
  {
    id: 'pro',
    name: '专业版',
    level: 'pro',
    monthlyPrice: 299,
    yearlyPrice: 2990, // ~17% discount
    maxEmployees: 200,
    maxDepartments: 20,
    features: [
      '最多200名员工',
      '最多20个部门',
      '完整九宫格分析',
      '继任计划管理',
      '行动计划跟踪',
      '语音转录功能',
      'AI深度分析',
      '数据导出功能',
      '优先客服支持'
    ],
    stripePriceIdMonthly: 'price_pro_monthly', // Replace with actual Stripe Price ID
    stripePriceIdYearly: 'price_pro_yearly'
  },
  {
    id: 'enterprise',
    name: '企业版',
    level: 'enterprise',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    maxEmployees: 9999,
    maxDepartments: 100,
    features: [
      '无限员工数量',
      '无限部门数量',
      '所有专业版功能',
      '自定义集成',
      'API访问',
      '专属客户经理',
      'SLA保障',
      '数据安全审计',
      '本地化部署选项'
    ],
    stripePriceIdMonthly: 'price_enterprise_monthly',
    stripePriceIdYearly: 'price_enterprise_yearly'
  }
];

// ========================================
// STRIPE INITIALIZATION
// ========================================

/**
 * Initialize Stripe
 * In production, load Stripe.js from CDN or use @stripe/stripe-js package
 */
export const initializeStripe = async () => {
  // For MVP, return mock
  // In production:
  // import { loadStripe } from '@stripe/stripe-js';
  // return await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  
  return {
    confirmCardPayment: async () => ({ paymentIntent: { status: 'succeeded' } })
  };
};

// ========================================
// PAYMENT INTENT CREATION
// ========================================

/**
 * Create Stripe Payment Intent
 * This should be called from a backend API endpoint for security
 */
export const createPaymentIntent = async (
  tenantId: string,
  planId: string,
  billingPeriod: 'monthly' | 'yearly'
): Promise<{ success: boolean; clientSecret?: string; error?: string }> => {
  try {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan' };
    }

    const amount = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    // In production, call your backend API:
    // const response = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ tenantId, planId, billingPeriod, amount })
    // });
    // const data = await response.json();

    // For MVP, create mock payment intent
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment transaction record
    await createPaymentTransaction(
      tenantId,
      amount,
      planId,
      billingPeriod,
      `pi_mock_${Date.now()}`
    );

    return {
      success: true,
      clientSecret: mockClientSecret
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent'
    };
  }
};

// ========================================
// PAYMENT CONFIRMATION
// ========================================

/**
 * Confirm payment and update subscription
 */
export const confirmPayment = async (
  tenantId: string,
  paymentIntentId: string,
  planId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan' };
    }

    // Update payment transaction status
    await updatePaymentTransaction(paymentIntentId, {
      payment_status: 'succeeded'
    });

    // Update tenant subscription
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 month subscription

    await updateTenant(tenantId, {
      plan_level: plan.level,
      subscription_status: 'active',
      subscription_start_date: subscriptionStartDate.toISOString(),
      subscription_end_date: subscriptionEndDate.toISOString(),
      max_employees: plan.maxEmployees,
      max_departments: plan.maxDepartments
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment'
    };
  }
};

// ========================================
// SUBSCRIPTION MANAGEMENT
// ========================================

/**
 * Cancel subscription
 */
export const cancelSubscription = async (
  tenantId: string,
  stripeSubscriptionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // In production, call Stripe API to cancel subscription:
    // const response = await fetch('/api/cancel-subscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ tenantId, stripeSubscriptionId })
    // });

    // Update tenant subscription status
    await updateTenant(tenantId, {
      subscription_status: 'cancelled',
      plan_level: 'free',
      max_employees: 50,
      max_departments: 5
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription'
    };
  }
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (
  subscriptionStatus: string,
  subscriptionEndDate?: string
): boolean => {
  if (subscriptionStatus !== 'active') {
    return false;
  }

  if (subscriptionEndDate) {
    const endDate = new Date(subscriptionEndDate);
    return endDate > new Date();
  }

  return true;
};

// ========================================
// WEBHOOK HANDLING
// ========================================

/**
 * Handle Stripe webhooks
 * This should be implemented in a backend API endpoint
 */
export const handleStripeWebhook = async (
  event: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        const paymentIntent = event.data.object;
        await updatePaymentTransaction(paymentIntent.id, {
          payment_status: 'succeeded',
          stripe_charge_id: paymentIntent.latest_charge
        });
        break;

      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object;
        await updatePaymentTransaction(failedPayment.id, {
          payment_status: 'failed',
          failure_reason: failedPayment.last_payment_error?.message
        });
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const subscription = event.data.object;
        // Update tenant based on subscription.customer
        break;

      case 'customer.subscription.updated':
        // Handle subscription updates
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook handling failed'
    };
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyMonthlyEquivalent = yearlyPrice / 12;
  const discount = ((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice) * 100;
  return Math.round(discount);
};

/**
 * Format price for display
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  if (price === 0) return '免费';
  
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });
  
  return formatter.format(price);
};

/**
 * Get plan by level
 */
export const getPlanByLevel = (level: string): PricingPlan | undefined => {
  return PRICING_PLANS.find(p => p.level === level);
};

/**
 * Check if upgrade is available
 */
export const canUpgrade = (currentLevel: string, targetLevel: string): boolean => {
  const levels = ['free', 'pro', 'enterprise'];
  const currentIndex = levels.indexOf(currentLevel);
  const targetIndex = levels.indexOf(targetLevel);
  return targetIndex > currentIndex;
};
