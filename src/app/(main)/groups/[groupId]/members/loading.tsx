export default function MembersLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-4 animate-pulse">
      <div className="h-24 bg-muted rounded-2xl" />
      <div className="h-px bg-muted" />
      <div className="h-7 w-32 bg-muted rounded-lg" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-muted rounded-xl" />
      ))}
    </div>
  );
}
