import { Flame } from "lucide-react";

export default function MainLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Flame className="h-8 w-8 text-primary animate-pulse" />
    </div>
  );
}
