export default function CalendarLoading() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-4 animate-pulse">
      <div className="h-7 w-32 bg-muted rounded-lg" />
      <div className="h-80 bg-muted rounded-2xl" />
      <div className="h-20 bg-muted rounded-xl" />
    </div>
  );
}
