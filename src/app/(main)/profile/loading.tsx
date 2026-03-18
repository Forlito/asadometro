export default function ProfileLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-5 animate-pulse">
      <div className="flex flex-col items-center py-4">
        <div className="h-20 w-20 rounded-full bg-muted mb-3" />
        <div className="h-6 w-40 bg-muted rounded-lg mb-1" />
        <div className="h-4 w-48 bg-muted rounded-lg" />
      </div>
      <div className="h-px bg-muted" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
