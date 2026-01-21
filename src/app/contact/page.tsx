'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['Ledra 145, 1011', 'Nicosia, Cyprus'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+357 99 980809'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['info@aquadorcy.com'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon - Sat: 10:00 - 20:00', 'Sunday: 12:00 - 18:00'],
  },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      reset();
      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16 bg-gold-ambient min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-playfair text-gradient-gold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-400">
              We&apos;d love to hear from you. Get in touch with our team.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-dark-light rounded-2xl p-8 border border-gold/20">
              <h2 className="text-2xl font-playfair text-white mb-6">Send us a Message</h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We&apos;ll get back to you as soon as possible.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot field for spam protection - hidden from real users */}
                  <input
                    {...register('honeypot')}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] opacity-0 h-0 w-0"
                    aria-hidden="true"
                  />

                  {submitError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{submitError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Name *</label>
                      <input
                        {...register('name')}
                        type="text"
                        className={`w-full bg-dark border ${
                          errors.name ? 'border-red-500' : 'border-gold/30'
                        } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        className={`w-full bg-dark border ${
                          errors.email ? 'border-red-500' : 'border-gold/30'
                        } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone (Optional)</label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                      placeholder="+357 99 000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                    <input
                      {...register('subject')}
                      type="text"
                      className={`w-full bg-dark border ${
                        errors.subject ? 'border-red-500' : 'border-gold/30'
                      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors`}
                      placeholder="How can we help?"
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className={`w-full bg-dark border ${
                        errors.message ? 'border-red-500' : 'border-gold/30'
                      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none`}
                      placeholder="Tell us more..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-playfair text-white mb-8">Get in Touch</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-dark-light rounded-xl p-6 border border-gold/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-gray-400 text-sm">
                        {detail}
                      </p>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-dark-light rounded-xl overflow-hidden border border-gold/20 h-64"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3260.9!2d33.3619!3d35.1753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de19749d5d7c4b%3A0x2d8c4f5f8c6d7c4e!2sLedra%20Street%2C%20Nicosia!5e0!3m2!1sen!2scy!4v1620000000000!5m2!1sen!2scy"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
