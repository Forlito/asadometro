export default function GroupsLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-3 animate-pulse">
      <div className="h-7 w-32 bg-muted rounded-lg mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[72px] bg-muted rounded-2xl" />
      ))}
    </div>
  );
}
