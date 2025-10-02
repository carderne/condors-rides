import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-full max-w-[120ch] flex-col gap-4 p-4 md:w-9/10",
        className,
      )}
    >
      {children}
    </main>
  );
}
