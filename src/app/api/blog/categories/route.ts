import { NextResponse } from 'next/server';
import { getBlogCategories } from '@/lib/blog';

export async function GET() {
  const categories = await getBlogCategories();
  return NextResponse.json(categories);
}
