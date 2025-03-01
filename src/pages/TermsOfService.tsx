import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppDock } from '../components/AppDock';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="flex items-center mb-8">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
        </div>
        
        <div className="prose prose-invert">
          <p className="text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-12">
            <p className="text-gray-400 mb-4">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using tennant-ticker.com (the "Service") operated by Tennant Ticker ("us", "we", or "our").
            </p>
            <p className="text-gray-400 mb-4">
              Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
            </p>
            <p className="text-gray-400">
              By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">1. Subscriptions</h3>
            <div className="space-y-4 text-gray-400">
              <p>Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.</p>
              <p>At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or we cancel it. You may cancel your Subscription renewal through your online account management page.</p>
              <p>A valid payment method, including credit card, is required to process the payment for your Subscription. You shall provide us with accurate and complete billing information including full name, address, state, zip code, telephone number, and valid payment method information. By submitting such payment information, you automatically authorize us to charge all Subscription fees incurred through your account to any such payment instruments.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">2. Free Trial</h3>
            <div className="space-y-4 text-gray-400">
              <p>We may, at our sole discretion, offer a Subscription with a free trial for a limited period of time ("Free Trial").</p>
              <p>You may be required to enter your billing information in order to sign up for the Free Trial.</p>
              <p>If you do enter your billing information when signing up for the Free Trial, you will not be charged by us until the Free Trial has expired. On the last day of the Free Trial period, unless you cancelled your Subscription, you will be automatically charged the applicable Subscription fees for the type of Subscription you have selected.</p>
              <p>At any time and without notice, we reserve the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">3. Financial Data and Disclaimer</h3>
            <div className="space-y-4 text-gray-400">
              <p>The Service provides financial market data, analytics, and insights ("Financial Data"). You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Financial Data is provided for informational purposes only and does not constitute financial advice</li>
                <li>We make no guarantees about the accuracy, timeliness, or completeness of any Financial Data</li>
                <li>You are solely responsible for any investment decisions or actions you take based on the Financial Data</li>
                <li>Past performance is not indicative of future results</li>
                <li>Trading in financial instruments involves high risks including the risk of losing some, or all, of your investment amount</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">4. Intellectual Property</h3>
            <div className="space-y-4 text-gray-400">
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Tennant Ticker and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Tennant Ticker.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">5. Termination</h3>
            <div className="space-y-4 text-gray-400">
              <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
              <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">6. Limitation of Liability</h3>
            <div className="space-y-4 text-gray-400">
              <p>In no event shall Tennant Ticker, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use or alteration of your transmissions or content</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">7. Governing Law</h3>
            <div className="space-y-4 text-gray-400">
              <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.</p>
              <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">8. Changes to Terms</h3>
            <div className="space-y-4 text-gray-400">
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
              <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">9. Contact Us</h3>
            <div className="space-y-4 text-gray-400">
              <p>If you have any questions about these Terms, please contact us at legal@tennant-ticker.com.</p>
            </div>
          </section>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 