import * as React from "react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    indeterminate?: boolean
  }
>(({ className, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null)
  const resolvedRef = ref || innerRef

  React.useEffect(() => {
    if (typeof resolvedRef === "object" && resolvedRef !== null && "current" in resolvedRef && resolvedRef.current) {
      resolvedRef.current.indeterminate = !!indeterminate
    }
  }, [resolvedRef, indeterminate])

  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={resolvedRef}
      {...props}
    />
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox } 