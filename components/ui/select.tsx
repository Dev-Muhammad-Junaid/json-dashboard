import * as React from "react"
import { cn } from "../../lib/utils"
import { Check, ChevronDown } from "lucide-react"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    onValueChange?: (value: string) => void
  }
>(({ className, onValueChange, children, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(event.target.value)
    }
  }

  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    id?: string
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex-grow text-sm truncate", className)}
    {...props}
  >
    {children}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  >
    <div className="w-full p-1">
      {children}
    </div>
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    selected?: boolean
  }
>(({ className, children, value, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
    data-value={value}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {selected && <Check className="h-4 w-4" />}
    </span>
    <span className="truncate">{children}</span>
  </div>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} 