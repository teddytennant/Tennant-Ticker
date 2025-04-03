import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../services/stripeService';
import { AppDock } from '../components/AppDock';

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  planId: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    description: 'Basic access to market monitoring',
    features: [
      'Access to Investor Insight',
      'Up to 5 stocks in Stock Monitor',
      'Basic market data',
    ],
    buttonText: 'Get Started',
    planId: SUBSCRIPTION_PLANS.FREE.id,
  },
  {
    name: 'Plus',
    price: 20,
    description: 'Enhanced features for active traders',
    features: [
      'All Free features',
      'Up to 15 stocks in Stock Monitor',
      '20 AI Research messages per month',
      'Real-time market data',
      'Advanced analytics',
      'Email support',
    ],
    buttonText: 'Get Plus',
    isPopular: true,
    planId: SUBSCRIPTION_PLANS.PLUS.id,
  },
  {
    name: 'Pro',
    price: 50,
    description: 'Maximum power for professional traders',
    features: [
      'All Plus features',
      'Up to 100 stocks in Stock Monitor',
      '500 AI Research messages per month',
      'Premium market data',
      'Custom analytics',
      'Priority 24/7 support',
    ],
    buttonText: 'Get Pro',
    planId: SUBSCRIPTION_PLANS.PRO.id,
  },
];

export function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingTier] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.planId === 'free') {
      navigate('/signup');
      return;
    }

    // For Plus and Pro plans, redirect to signup with plan info
    navigate(`/signup?plan=${tier.planId}&billing=${billingInterval}`);
  };

  const getAnnualPrice = (monthlyPrice: number) => {
    const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return annualPrice / 12;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-white">Pricing Plans</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose the Perfect Plan for Your Trading Journey
          </h2>
          <p className="text-xl text-gray-400">
            Start with a free trial and upgrade anytime as your needs grow
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-gray-800 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-gray-800/50 rounded-2xl border ${
                tier.isPopular ? 'border-blue-500' : 'border-gray-700'
              } p-8 transition-transform hover:scale-105`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">
                    ${billingInterval === 'yearly' ? getAnnualPrice(tier.price) : tier.price}
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                {billingInterval === 'yearly' && tier.price > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    Save ${(tier.price * 0.2 * 12).toFixed(2)} yearly
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loadingTier === tier.planId}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  tier.isPopular
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingTier === tier.planId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tier.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Can I change plans later?
              </h4>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                Is there a long-term commitment?
              </h4>
              <p className="text-gray-400">
                No, all plans are month-to-month unless you choose yearly billing. You can cancel anytime.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, and digital wallets through our secure Stripe payment system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 