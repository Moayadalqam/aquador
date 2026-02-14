import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Aquad'or shipping and returns policy. Same-day delivery in Nicosia, 1-3 days across Cyprus. 14-day returns on unopened items.",
  openGraph: {
    title: "Shipping & Returns | Aquad'or Cyprus",
    description: "Same-day delivery in Nicosia, 1-3 days across Cyprus. 14-day returns on unopened items.",
    url: 'https://aquadorcy.com/shipping',
  },
  alternates: {
    canonical: 'https://aquadorcy.com/shipping',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
