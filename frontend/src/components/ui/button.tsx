'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', asChild = false, className, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Base styles
    let baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      outline: 'none',
    }

    // Variant styles
    let variantStyle: React.CSSProperties = {}

    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: '#2563eb',
          color: '#ffffff',
        }
        break
      case 'destructive':
        variantStyle = {
          backgroundColor: '#dc2626',
          color: '#ffffff',
        }
        break
      case 'outline':
        variantStyle = {
          backgroundColor: '#ffffff',
          color: '#111827',
          border: '1px solid #d1d5db',
        }
        break
      case 'secondary':
        variantStyle = {
          backgroundColor: '#e5e7eb',
          color: '#111827',
        }
        break
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
          color: '#111827',
        }
        break
      case 'link':
        variantStyle = {
          backgroundColor: 'transparent',
          color: '#2563eb',
          textDecoration: 'underline',
        }
        break
    }

    // Size styles
    let sizeStyle: React.CSSProperties = {}
    switch (size) {
      case 'sm':
        sizeStyle = {
          height: '36px',
          paddingLeft: '12px',
          paddingRight: '12px',
        }
        break
      case 'lg':
        sizeStyle = {
          height: '44px',
          paddingLeft: '32px',
          paddingRight: '32px',
        }
        break
      case 'icon':
        sizeStyle = {
          height: '40px',
          width: '40px',
          padding: '0',
        }
        break
      default:
        sizeStyle = {
          height: '40px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }
        break
    }

    // Hover states
    const handleMouseEnter = (e: React.MouseEvent) => {
      const element = e.currentTarget as HTMLButtonElement
      switch (variant) {
        case 'default':
          element.style.backgroundColor = '#1d4ed8'
          break
        case 'destructive':
          element.style.backgroundColor = '#b91c1c'
          break
        case 'outline':
          element.style.backgroundColor = '#f3f4f6'
          break
        case 'secondary':
          element.style.backgroundColor = '#d1d5db'
          break
        case 'ghost':
          element.style.backgroundColor = '#f3f4f6'
          break
      }
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
      const element = e.currentTarget as HTMLButtonElement
      switch (variant) {
        case 'default':
          element.style.backgroundColor = '#2563eb'
          break
        case 'destructive':
          element.style.backgroundColor = '#dc2626'
          break
        case 'outline':
          element.style.backgroundColor = '#ffffff'
          break
        case 'secondary':
          element.style.backgroundColor = '#e5e7eb'
          break
        case 'ghost':
          element.style.backgroundColor = 'transparent'
          break
      }
    }

    return (
      <Comp
        ref={ref}
        style={{
          ...baseStyle,
          ...variantStyle,
          ...sizeStyle,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }