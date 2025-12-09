import { cn } from "@/lib/utils";

export function SlideWrapper({
  children,
  className,
  gradient = "from-pink-600 via-pink-500 to-rose-400",
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center rounded-3xl p-8 text-white md:min-h-[600px]",
        `bg-gradient-to-br ${gradient}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
