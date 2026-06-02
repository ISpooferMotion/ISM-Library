'use client';
// Our core Button primitive.
// We use Framer Motion for the snappy scaling animations on hover and tap.
// Pro tip: If you need an icon-only button, pass the isIconOnly flag so the padding stays perfectly square.

import { HTMLMotionProps, motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import React, { forwardRef, memo, isValidElement } from 'react';
import { easeFast, reducedMotionTransition, springSnappy } from '../utils/animations';

const getElementKey = (el: any, fallback: string) => {
  if (isValidElement(el)) {
    return (el.type as any)?.name || (el.type as string) || fallback;
  }
  return fallback;
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'color'> {
  as?: React.ElementType;
  variant?: 'solid' | 'flat' | 'ghost' | 'bordered';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isIconOnly?: boolean;
  label?: React.ReactNode;
}

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        children,
        className = '',
        variant = 'solid',
        color = 'default',
        size = 'md',
        fullWidth = false,
        isLoading = false,
        startContent,
        endContent,
        isIconOnly = false,
        disabled,
        label,
        ...props
      },
      ref,
    ) => {
      const shouldReduceMotion = useReducedMotion();
      const contentTransition = shouldReduceMotion ? reducedMotionTransition : easeFast;
      // Base structural classes and custom focus rings shared by every button.
      const baseClasses = [
        'relative inline-flex items-center justify-center box-border appearance-none',
        'select-none whitespace-nowrap font-medium subpixel-antialiased overflow-hidden',
        'outline-none transition-colors duration-150',
        '',
      ].join(' ');

      // Scale padding and min-width by size. Icon-only buttons are forced to be perfectly square.
      const sizeClasses = {
        sm: isIconOnly ? 'w-8 h-8 min-w-8 text-sm gap-1.5' : 'px-3 min-w-16 h-8 text-sm gap-1.5',
        md: isIconOnly ? 'w-10 h-10 min-w-10 text-base gap-2' : 'px-4 min-w-20 h-10 text-sm gap-2',
        lg: isIconOnly ? 'w-12 h-12 min-w-12 text-lg gap-2' : 'px-6 min-w-24 h-12 text-base gap-2',
      };

      const radiusClasses = {
        sm: 'rounded-[var(--radius-sm)]',
        md: 'rounded-[var(--radius-md)]',
        lg: 'rounded-[var(--radius-lg)]',
      };

      // A slightly chunky switch block, but it reliably maps our semantic colors to their specific variants.
      const getColors = () => {
        const solidClasses = {
          primary: 'bg-text-primary text-bg-base hover:opacity-90 active:opacity-80',
          secondary: 'bg-secondary text-white hover:opacity-90 active:opacity-80',
          danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
          success: 'bg-success text-white hover:opacity-90 active:opacity-80',
          warning: 'bg-warning text-white hover:opacity-90 active:opacity-80',
          default:
            'bg-bg-elevated text-text-primary border border-border-strong hover:bg-border-subtle hover:border-border-strong',
        };
        const softClasses = {
          primary: 'bg-text-primary/10 text-text-primary hover:bg-text-primary/15',
          secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/15',
          danger: 'bg-danger/10 text-danger hover:bg-danger/15',
          success: 'bg-success/10 text-success hover:bg-success/15',
          warning: 'bg-warning/10 text-warning hover:bg-warning/15',
          default:
            'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
        };
        const borderedClasses = {
          primary: 'border border-text-primary/50 text-text-primary hover:bg-text-primary/10',
          secondary: 'border border-secondary/50 text-secondary hover:bg-secondary/10',
          danger: 'border border-danger text-danger hover:bg-danger/10',
          success: 'border border-success text-success hover:bg-success/10',
          warning: 'border border-warning text-warning hover:bg-warning/10',
          default: 'border border-border-strong text-text-primary hover:bg-bg-elevated',
        };
        const ghostClasses = {
          primary: 'text-text-primary hover:bg-text-primary/10',
          secondary: 'text-secondary hover:bg-secondary/10',
          danger: 'text-danger hover:bg-danger/10',
          success: 'text-success hover:bg-success/10',
          warning: 'text-warning hover:bg-warning/10',
          default: softClasses.default,
        };
        if (variant === 'solid') {
          return solidClasses[color];
        }
        if (variant === 'flat') {
          return softClasses[color];
        }
        if (variant === 'bordered') {
          return borderedClasses[color];
        }
        if (variant === 'ghost') {
          return ghostClasses[color];
        }
        return '';
      };

      const widthClass = fullWidth ? 'w-full' : '';
      // Combine disabled and isLoading states here to cleanly block pointer events and dim the button.
      const disabledClass =
        disabled || isLoading
          ? 'opacity-40 cursor-not-allowed pointer-events-none'
          : 'cursor-pointer';

      return (
        <motion.button
          ref={ref}
          whileHover={
            !(disabled || isLoading || shouldReduceMotion)
              ? { scale: 1.012, transition: springSnappy }
              : undefined
          }
          whileTap={
            !(disabled || isLoading || shouldReduceMotion)
              ? { scale: 0.975, transition: springSnappy }
              : undefined
          }
          className={[
            baseClasses,
            sizeClasses[size],
            radiusClasses[size],
            getColors(),
            widthClass,
            disabledClass,
            className,
          ].join(' ')}
          disabled={disabled || isLoading}
          {...props}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={contentTransition}
                className="flex items-center justify-center flex-shrink-0"
              >
                <svg
                  className="animate-spin h-4 w-4 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </motion.div>
            ) : startContent ? (
              <motion.div
                key={getElementKey(startContent, 'start-content')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={contentTransition}
                className="flex items-center flex-shrink-0"
              >
                {startContent as any}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {typeof (label || children) === 'string' || typeof (label || children) === 'number' ? (
            <AnimatePresence mode="wait">
              <motion.span
                key={String(label || children)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={contentTransition}
                className="inline-block"
              >
                {label || (children as any)}
              </motion.span>
            </AnimatePresence>
          ) : (
            label || (children as any)
          )}

          <AnimatePresence mode="wait">
            {endContent && !isLoading ? (
              <motion.div
                key={getElementKey(endContent, 'end-content')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={contentTransition}
                className="flex items-center flex-shrink-0"
              >
                {endContent as any}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.button>
      );
    },
  ),
);

Button.displayName = 'Button';
