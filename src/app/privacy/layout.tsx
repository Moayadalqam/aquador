import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Aquad'or privacy policy. Learn how we collect, use, and protect your personal information when you shop with us in Cyprus.",
  alternates: {
    canonical: 'https://aquadorcy.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
