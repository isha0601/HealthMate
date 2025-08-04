import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-animated",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-glow active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:border-primary/50 active:scale-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:shadow-wellness active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95",
        glow: "bg-gradient-primary text-primary-foreground btn-glow hover:scale-110 hover:shadow-glow active:scale-95",
        wellness: "bg-gradient-wellness text-white hover:scale-105 hover:shadow-wellness active:scale-95",
        animated: "bg-primary text-primary-foreground relative overflow-hidden hover:scale-105 hover:shadow-glow active:scale-95 before:absolute before:inset-0 before:bg-white/20 before:rounded-md before:scale-0 before:transition-transform before:duration-300 hover:before:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        bounce: "hover:animate-button-bounce",
        pulse: "animate-health-pulse",
        glow: "animate-glow-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  animation?: "none" | "bounce" | "pulse" | "glow"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
