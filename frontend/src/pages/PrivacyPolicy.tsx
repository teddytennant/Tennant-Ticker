import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppDock } from '../components/AppDock';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="flex items-center mb-8">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert">
          <p className="text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-12">
            <p className="text-gray-400 mb-4">
              This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from tennant-ticker.com (the "Site").
            </p>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">1. Personal Information We Collect</h3>
            <div className="space-y-4 text-gray-400">
              <p>When you visit the Site, we automatically collect certain information about your device, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Information about your web browser</li>
                <li>IP address</li>
                <li>Time zone</li>
                <li>Some of the cookies that are installed on your device</li>
              </ul>
              <p>Additionally, as you browse the Site, we collect information about:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Individual web pages or products that you view</li>
                <li>What websites or search terms referred you to the Site</li>
                <li>Information about how you interact with the Site</li>
              </ul>
              <p>We refer to this automatically-collected information as "Device Information."</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">2. How We Use Your Personal Information</h3>
            <div className="space-y-4 text-gray-400">
              <p>We use the Device Information that we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Help us screen for potential risk and fraud</li>
                <li>Improve and optimize our Site</li>
                <li>Analyze how our customers browse and use the Site</li>
                <li>Assess the success of our marketing and advertising campaigns</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">3. Sharing Your Personal Information</h3>
            <div className="space-y-4 text-gray-400">
              <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Analytics services to help us understand how our customers use the Site</li>
                <li>Payment processors to securely process your payments</li>
              </ul>
              <p>We may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">4. Data Retention</h3>
            <div className="space-y-4 text-gray-400">
              <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">5. Changes</h3>
            <div className="space-y-4 text-gray-400">
              <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">6. Your Rights</h3>
            <div className="space-y-4 text-gray-400">
              <p>If you are a European resident, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access personal information we hold about you</li>
                <li>Ask that your personal information be corrected, updated, or deleted</li>
                <li>Object to our processing of your personal information</li>
                <li>Request restriction of processing of your personal information</li>
                <li>Data portability</li>
                <li>Withdraw your consent</li>
              </ul>
              <p>Additionally, if you are a European resident we note that we are processing your information in order to fulfill contracts we might have with you, or otherwise to pursue our legitimate business interests listed above.</p>
            </div>
          </section>

          <section className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">7. Contact Us</h3>
            <div className="space-y-4 text-gray-400">
              <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e‑mail at privacy@tennant-ticker.com.</p>
            </div>
          </section>
        </div>
      </div>

      {/* App Dock */}
      <AppDock />
    </div>
  );
} 