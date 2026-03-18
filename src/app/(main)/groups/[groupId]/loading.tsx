export default function GroupLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-muted rounded-2xl" />
      ))}
    </div>
  );
}
