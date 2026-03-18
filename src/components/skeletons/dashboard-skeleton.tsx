export function DashboardSkeleton() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-muted rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-7 w-32 bg-muted rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
