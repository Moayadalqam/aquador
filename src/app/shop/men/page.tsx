import { buildGenderMetadata, renderGenderPage } from '@/lib/shop/gender-page';

export const revalidate = 1800;

export const metadata = buildGenderMetadata('men');

export default async function MenShopPage() {
  return renderGenderPage('men');
}
