import Link from 'next/link';
import { Home, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-playfair text-gradient-gold mb-4">
            404
          </h1>
          <h2 className="text-2xl font-playfair text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400">
            The fragrance you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button>
              <Package className="w-5 h-5 mr-2" />
              Browse Collection
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
