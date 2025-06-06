
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  pageSize: number;
}

export function LoadingState({ pageSize }: LoadingStateProps) {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: pageSize }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
