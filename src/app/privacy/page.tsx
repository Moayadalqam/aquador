'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16 bg-gold-ambient min-h-screen">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-playfair text-gradient-gold mb-4"
          >
            Privacy Policy
          </motion.h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-light rounded-2xl p-8 border border-gold/20 space-y-8"
        >
          <p className="text-gray-400">
            Aquad&apos;or is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or purchase our products. By using our website, you agree to the collection and use of information in accordance with this policy.
          </p>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-400">
              <h3 className="text-lg text-white">1.1 Personal Data</h3>
              <p>
                We may collect personal identification information including: name, email address, mailing address, phone number, and credit card information when you register, place an order, subscribe to our newsletter, or fill out forms.
              </p>
              <h3 className="text-lg text-white">1.2 Non-Personal Data</h3>
              <p>
                We may collect non-personal information about your interaction with our site, including browser name, computer type, and technical information about your means of connection such as operating system and Internet service provider.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-400">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Customer Service:</strong> To respond to your requests and support needs.</li>
                <li><strong className="text-white">User Experience:</strong> To understand how users interact with our services.</li>
                <li><strong className="text-white">Process Transactions:</strong> To complete your orders. We do not share this information except to provide the service.</li>
                <li><strong className="text-white">Send Communications:</strong> To send order updates and occasional company news. You can unsubscribe at any time.</li>
                <li><strong className="text-white">Improve Our Site:</strong> Based on your feedback and usage patterns.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">3. How We Protect Your Information</h2>
            <p className="text-gray-400">
              We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">4. Sharing Your Information</h2>
            <p className="text-gray-400">
              We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-400">
              We use cookies and similar technologies to enhance your browsing experience and analyze website traffic. You can manage your cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">6. Your Rights</h2>
            <p className="text-gray-400">
              You have the right to access, update, or delete your personal information. Please contact us if you need assistance with any of these requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">7. Changes to this Policy</h2>
            <p className="text-gray-400">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="pt-6 border-t border-gold/20">
            <h2 className="text-xl font-playfair text-gold mb-4">Contact Us</h2>
            <div className="text-gray-400 space-y-1">
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <p><strong className="text-white">Email:</strong> info@aquadorcy.com</p>
              <p><strong className="text-white">Phone:</strong> +357 99 980809</p>
              <p><strong className="text-white">Address:</strong> Ledra 145, 1011, Nicosia, Cyprus</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
