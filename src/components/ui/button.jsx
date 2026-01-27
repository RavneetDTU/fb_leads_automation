import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90",
    destructive: "bg-red-500 text-white hover:bg-red-500/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline",
}

const buttonSizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {

    // Select styling based on props
    const variantStyles = buttonVariants[variant] || buttonVariants.default
    const sizeStyles = buttonSizes[size] || buttonSizes.default

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variantStyles,
                sizeStyles,
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
