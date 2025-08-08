import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  text?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", text = "加载中...", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6", 
      lg: "h-8 w-8"
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size])} />
        {text && <span className="ml-3 text-muted-foreground">{text}</span>}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }