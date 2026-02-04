import { NextResponse } from 'next/server';
import { getFeaturedPost } from '@/lib/blog';

export async function GET() {
  const post = await getFeaturedPost();
  return NextResponse.json(post);
}
