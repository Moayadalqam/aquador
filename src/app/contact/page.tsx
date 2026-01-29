'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { track } from '@vercel/analytics';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageHero } from '@/components/ui/Section';

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
    icon: <MapPin className="w-5 h-5 text-gold" />,
    title: 'Visit Us',
    details: ['Ledra 145, 1011', 'Nicosia, Cyprus'],
  },
  {
    icon: <Phone className="w-5 h-5 text-gold" />,
    title: 'Call Us',
    details: ['+357 99 980809'],
  },
  {
    icon: <Mail className="w-5 h-5 text-gold" />,
    title: 'Email Us',
    details: ['info@aquadorcy.com'],
  },
  {
    icon: <Clock className="w-5 h-5 text-gold" />,
    title: 'Hours',
    details: ['Mon-Sat: 10-20', 'Sun: 12-18'],
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      track('contact_submitted', { subject: data.subject });

      setIsSubmitted(true);
      reset();
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gold-ambient">
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Get in touch with our team."
      />

      <section className="section-sm">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-8">
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Honeypot field for spam protection */}
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
                        <label className="label-micro mb-2 block">Name *</label>
                        <input
                          {...register('name')}
                          type="text"
                          className={`input-base ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Your name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="label-micro mb-2 block">Email *</label>
                        <input
                          {...register('email')}
                          type="email"
                          className={`input-base ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="label-micro mb-2 block">Phone (Optional)</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input-base"
                        placeholder="+357 99 000000"
                      />
                    </div>

                    <div>
                      <label className="label-micro mb-2 block">Subject *</label>
                      <input
                        {...register('subject')}
                        type="text"
                        className={`input-base ${errors.subject ? 'border-red-500' : ''}`}
                        placeholder="How can we help?"
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label-micro mb-2 block">Message *</label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        className={`input-base resize-none ${errors.message ? 'border-red-500' : ''}`}
                        placeholder="Tell us more..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
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
                <h2 className="text-2xl font-playfair text-white mb-6">Get in Touch</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="glass-card p-5"
                    >
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-3">
                        {item.icon}
                      </div>
                      <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-gray-400 text-xs">
                          {detail}
                        </p>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card overflow-hidden h-64"
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
      </section>
    </div>
  );
}
