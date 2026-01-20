'use client';

import { motion } from 'framer-motion';
import { Truck, RotateCcw, Clock, Package } from 'lucide-react';

export default function ShippingPage() {
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
            Shipping & Returns
          </motion.h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Clock, label: '24h Processing' },
            { icon: Truck, label: 'Fast Delivery' },
            { icon: RotateCcw, label: '14-Day Returns' },
            { icon: Package, label: 'Secure Packaging' },
          ].map((item, i) => (
            <div key={i} className="bg-dark-light rounded-xl p-4 text-center border border-gold/20">
              <item.icon className="w-8 h-8 text-gold mx-auto mb-2" />
              <span className="text-sm text-gray-400">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-invert prose-gold max-w-none"
        >
          <div className="bg-dark-light rounded-2xl p-8 border border-gold/20 space-y-8">
            <section>
              <h2 className="text-2xl font-playfair text-gold mb-4">Shipping Information</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  Thank you for shopping at Aquad&apos;or Cyprus! We understand that receiving your order promptly and securely is important. This policy outlines our shipping and return processes.
                </p>
                <h3 className="text-lg text-white">Order Processing</h3>
                <p>
                  We strive to process and ship all orders within 24 business hours (excluding Sundays and public holidays) after receiving your order confirmation.
                </p>
                <h3 className="text-lg text-white">Delivery Times</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Nicosia Area:</strong> Same-day delivery for orders placed before noon, next-day delivery for orders placed after noon.</li>
                  <li><strong className="text-white">Major Cities in Cyprus:</strong> Within 1-2 business days.</li>
                  <li><strong className="text-white">Other Areas in Cyprus:</strong> Within 2-3 business days.</li>
                </ul>
                <h3 className="text-lg text-white">Tracking Your Order</h3>
                <p>
                  Once your order is shipped, you&apos;ll receive a notification email with a tracking number that allows you to monitor your package&apos;s progress.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-playfair text-gold mb-4">International Shipping</h2>
              <p className="text-gray-400">
                We currently do not offer international shipping. However, we&apos;re constantly evaluating our services and may introduce international options in the future. Stay tuned for updates!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-playfair text-gold mb-4">Returns & Exchanges</h2>
              <div className="space-y-4 text-gray-400">
                <p>
                  We want you to be completely satisfied with your purchase. If, for any reason, you&apos;re not happy with your order, we offer returns and exchanges within 14 days of receiving your package.
                </p>
                <h3 className="text-lg text-white">Eligibility for Return/Exchange</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Unopened, unused, and undamaged items in their original packaging with all tags attached are eligible.</li>
                  <li>For hygiene reasons, we cannot accept returns of opened perfumes.</li>
                  <li>Items damaged during shipping must be reported within 24 hours of receipt for a replacement.</li>
                </ul>
                <h3 className="text-lg text-white">Return Process</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our Customer Service team at +357 99 980809 or info@aquadorcy.com to initiate a return.</li>
                  <li>We&apos;ll provide you with a return authorization number (RAN) and instructions.</li>
                  <li>Pack the item securely in its original packaging and include the RAN slip.</li>
                  <li>Ship the package to the address we provide. You are responsible for return shipping costs.</li>
                </ol>
                <h3 className="text-lg text-white">Refunds</h3>
                <p>
                  Once we receive your returned item and verify it meets the return criteria, we&apos;ll initiate a refund to your original payment method within 5-7 business days. Shipping costs will not be refunded.
                </p>
              </div>
            </section>

            <section className="pt-6 border-t border-gold/20">
              <p className="text-gray-500 text-sm">
                For any questions about our shipping and return policy, please contact our Customer Service team. We&apos;re happy to assist you!
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
