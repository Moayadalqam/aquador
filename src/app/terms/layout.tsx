import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Aquad'or terms of service. Read our terms and conditions for using our website and purchasing luxury fragrances in Cyprus.",
  alternates: {
    canonical: 'https://aquadorcy.com/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
