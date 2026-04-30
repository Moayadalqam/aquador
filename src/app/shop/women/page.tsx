import { buildGenderMetadata, renderGenderPage } from '@/lib/shop/gender-page';

export const revalidate = 1800;

export const metadata = buildGenderMetadata('women');

export default async function WomenShopPage() {
  return renderGenderPage('women');
}
