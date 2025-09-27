import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-200 animate-pulse duration-300 rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
