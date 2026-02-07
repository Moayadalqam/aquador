import type { Metadata } from 'next';
import { getGiftSetStock } from '@/lib/supabase/inventory-service';
import { VALENTINE_GIFT_SET, getAquadorPerfumes, getAquadorBodyLotions } from '@/lib/gift-sets';
import GiftSetContent from './GiftSetContent';

export const metadata: Metadata = {
  title: "Written in Scent | Valentine Gift Set | Aquad'or Cyprus",
  description:
    "A curated pairing of two signature Aquad'or creations — one perfume and one body lotion — chosen by you, wrapped in luxury. Limited edition Valentine gift set, only 24 available.",
  openGraph: {
    title: "Written in Scent — Valentine Gift Set | Aquad'or",
    description:
      "Choose your perfect perfume and body lotion pairing. Limited edition luxury gift set from Aquad'or Cyprus.",
    images: [VALENTINE_GIFT_SET.image],
  },
};

export const revalidate = 0;

export default async function ValentineGiftSetPage() {
  const stock = await getGiftSetStock(VALENTINE_GIFT_SET.id);
  const perfumes = getAquadorPerfumes();
  const lotions = getAquadorBodyLotions();

  return (
    <GiftSetContent
      isSoldOut={stock <= 0}
      perfumes={perfumes.map((p) => ({ id: p.id, name: p.name }))}
      lotions={lotions.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
