import type { Metadata } from 'next';
import ValentinesContent from './ValentinesContent';

export const metadata: Metadata = {
  title: "Valentine's Day Gifts Cyprus | Luxury Perfume Gift Sets | Aquad'or",
  description:
    "Find the perfect Valentine's Day gift in Cyprus. Luxury perfume gift sets, curated fragrances, and custom scent creation from Aquad'or. Free shipping across Cyprus.",
  keywords: [
    'valentines cyprus',
    'valentine perfume cyprus',
    'valentine gifts cyprus',
    'luxury perfume gift set',
    'valentines day perfume',
    'aquador valentine',
    'perfume gift cyprus',
  ],
  openGraph: {
    title: "Valentine's Day Gifts | Aquad'or Cyprus",
    description:
      "Luxury perfume gift sets and curated fragrances for Valentine's Day. Free shipping across Cyprus.",
  },
};

export default function ValentinesPage() {
  return <ValentinesContent />;
}
