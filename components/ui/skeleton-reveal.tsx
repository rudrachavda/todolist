import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
}

export function SkeletonReveal({
  isLoading,
  skeleton,
  children,
  className,
  ...props
}: SkeletonRevealProps) {
  // We use a small state to handle the reset transition if needed, 
  // though for simple loading -> revealed, just toggling classes is fine.
  
  return (
    <div 
      className={cn("t-skel", !isLoading && "is-revealed", className)} 
      data-state={isLoading ? "loading" : "ready"}
      {...props}
    >
      <div className="t-skel-skeleton is-pulsing">
        {skeleton}
      </div>
      <div className={cn("t-skel-content", isLoading && "pointer-events-none")}>
        {children}
      </div>
    </div>
  )
}
