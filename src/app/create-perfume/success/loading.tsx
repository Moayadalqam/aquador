import { LuxurySkeleton } from '@/components/ui/LuxurySkeleton';

export default function CreatePerfumeSuccessLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <LuxurySkeleton className="w-20 h-20 rounded-full mx-auto" />
          <LuxurySkeleton className="h-10 w-80 max-w-full mx-auto" />
          <LuxurySkeleton className="h-6 w-96 max-w-full mx-auto" />
          <div className="pt-6 space-y-3">
            <LuxurySkeleton className="h-4 w-full" />
            <LuxurySkeleton className="h-4 w-5/6" />
            <LuxurySkeleton className="h-4 w-4/6" />
          </div>
          <LuxurySkeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </main>
  );
}
