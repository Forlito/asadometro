export default function RankingLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="h-16 bg-muted rounded-2xl" />
      <div className="h-7 w-48 bg-muted rounded-lg" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
