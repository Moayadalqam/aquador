import { buildGenderMetadata, renderGenderPage } from '@/lib/shop/gender-page';

export const revalidate = 1800;

export const metadata = buildGenderMetadata('unisex');

export default async function UnisexShopPage() {
  return renderGenderPage('unisex');
}
