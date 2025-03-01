import axios from 'axios';

const STRIPE_API_URL = import.meta.env.VITE_API_URL + '/stripe';

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: {
    monthly: string;
    yearly: string;
  };
}

// These IDs should match your Stripe product price IDs
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    id: 'free',
    name: 'Free Trial',
    priceId: {
      monthly: 'free',
      yearly: 'free',
    },
  },
  PLUS: {
    id: 'plus',
    name: 'Plus',
    priceId: {
      monthly: 'price_plus_monthly', // Replace with your Stripe price ID
      yearly: 'price_plus_yearly',   // Replace with your Stripe price ID
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    priceId: {
      monthly: 'price_pro_monthly',  // Replace with your Stripe price ID
      yearly: 'price_pro_yearly',    // Replace with your Stripe price ID
    },
  },
};

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<string> {
  try {
    const response = await axios.post(`${STRIPE_API_URL}/create-checkout-session`, {
      priceId,
      successUrl,
      cancelUrl,
    });

    return response.data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

export async function getSubscriptionStatus(): Promise<{
  isActive: boolean;
  plan: string;
  trialEnd?: Date;
}> {
  try {
    const response = await axios.get(`${STRIPE_API_URL}/subscription-status`);
    return response.data;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new Error('Failed to get subscription status');
  }
}

export async function cancelSubscription(): Promise<void> {
  try {
    await axios.post(`${STRIPE_API_URL}/cancel-subscription`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

export async function updateSubscription(newPriceId: string): Promise<void> {
  try {
    await axios.post(`${STRIPE_API_URL}/update-subscription`, {
      newPriceId,
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
} 