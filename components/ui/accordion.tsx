"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionItemProps {
  value: string
  trigger: React.ReactNode
  children: React.ReactNode
  isOpen?: boolean
  className?: string
}

const AccordionItem = ({
  trigger,
  children,
  value,
  className,
}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={cn("border-b", className)}>
      <div className="flex">
        <h3 className="flex-1">
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
              isOpen ? "text-blue-600" : ""
            )}
            aria-expanded={isOpen}
          >
            {trigger}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </h3>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          isOpen ? "data-[state=open]" : "data-[state=closed] h-0"
        )}
      >
        {isOpen && (
          <div className="pb-4 pt-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

const Accordion = ({
  children,
  className,
}: AccordionProps) => {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

const AccordionTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("flex", className)}>{children}</div>
}

const AccordionContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("", className)}>{children}</div>
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
}

export default Accordion
