import { Icon } from "@/components/ui/icon";

export default function MainLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Icon name="local_fire_department" className="text-primary text-3xl animate-pulse" />
    </div>
  );
}
