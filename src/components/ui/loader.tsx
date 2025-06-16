import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface LoaderProps {
  className?: string
  text?: string
}

export function Loader({ className, text }: LoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
    >
      <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function PageLoader({ text = "Loading Application" }: { text?: string }) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader text={text} />
        </div>
    )
}

export function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 p-4">
            <div className="relative overflow-hidden h-10 w-10 flex-shrink-0 rounded bg-muted">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-200/50 dark:via-neutral-700/50 to-transparent"></div>
            </div>
            <div className="flex-1 space-y-2">
                 <div className="relative overflow-hidden h-4 w-3/4 rounded bg-muted">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-200/50 dark:via-neutral-700/50 to-transparent"></div>
                </div>
                 <div className="relative overflow-hidden h-4 w-1/2 rounded bg-muted">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-200/50 dark:via-neutral-700/50 to-transparent"></div>
                </div>
            </div>
            <div className="relative overflow-hidden h-5 w-16 rounded bg-muted">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-200/50 dark:via-neutral-700/50 to-transparent"></div>
            </div>
            <div className="relative overflow-hidden h-9 w-9 rounded-full bg-muted">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-neutral-200/50 dark:via-neutral-700/50 to-transparent"></div>
            </div>
        </div>
    )
}
