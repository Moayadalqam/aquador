'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16 bg-dark min-h-screen">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-playfair text-gradient-gold mb-4"
          >
            Terms of Service
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
            Welcome to Aquad&apos;or. By accessing or using our website aquadorcy.com, purchasing our products, or using our services, you agree to be bound by these Terms of Service. Please read these Terms carefully.
          </p>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">1. Use of the Website</h2>
            <div className="space-y-4 text-gray-400">
              <h3 className="text-lg text-white">1.1 Eligibility</h3>
              <p>
                By using our website, you represent and warrant that you are at least 18 years old or accessing the site under the supervision of a parent or guardian.
              </p>
              <h3 className="text-lg text-white">1.2 Account</h3>
              <p>
                You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and for all activities under your account. Notify us immediately of any unauthorized use.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">2. Products and Orders</h2>
            <div className="space-y-4 text-gray-400">
              <h3 className="text-lg text-white">2.1 Product Information</h3>
              <p>
                We strive to ensure accuracy of all information on our website. However, we do not guarantee that product descriptions, prices, or other content are accurate, complete, reliable, current, or error-free. We reserve the right to correct errors and update information at any time.
              </p>
              <h3 className="text-lg text-white">2.2 Order Acceptance</h3>
              <p>
                Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order at any time for any reason.
              </p>
              <h3 className="text-lg text-white">2.3 Payment</h3>
              <p>
                You agree to pay all charges associated with your orders. We accept various payment methods as indicated on our site. All payments must be received in full prior to shipment.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">3. Shipping and Returns</h2>
            <div className="space-y-4 text-gray-400">
              <p>
                We will make reasonable efforts to ensure delivery times are met, but we cannot be held responsible for delays due to unforeseen circumstances. Please review our Shipping & Returns policy for detailed information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">4. Intellectual Property</h2>
            <p className="text-gray-400">
              All content on our website, including text, graphics, logos, images, and software, is the property of Aquad&apos;or or its content suppliers and is protected by international copyright laws. You may not use, reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-400">
              To the fullest extent permitted by law, Aquad&apos;or shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use or inability to use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">6. Governing Law</h2>
            <p className="text-gray-400">
              These Terms shall be governed and construed in accordance with the laws of Cyprus. You agree to submit to the personal jurisdiction of the courts located in Cyprus for any disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">7. Changes to Terms</h2>
            <p className="text-gray-400">
              We reserve the right to modify these Terms at any time. Material changes will be notified at least 30 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-playfair text-gold mb-4">8. Contact Us</h2>
            <div className="text-gray-400 space-y-1">
              <p>If you have questions about these Terms, please contact us:</p>
              <p><strong className="text-white">Email:</strong> info@aquadorcy.com</p>
              <p><strong className="text-white">Phone:</strong> +357 99 980809</p>
              <p><strong className="text-white">Address:</strong> Ledra 145, 1011, Nicosia, Cyprus</p>
            </div>
          </section>

          <p className="text-gray-500 text-sm pt-6 border-t border-gold/20">
            By using our website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
