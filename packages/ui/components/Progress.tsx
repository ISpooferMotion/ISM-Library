'use client';
// A straightforward progress bar. The width of the fill animates so it moves smoothly during updates.

import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import { easeSmooth, reducedMotionTransition } from '../utils/animations';

interface ProgressProps {
  value?: number;
  isIndeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
  label?: string;
  showValueLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = React.memo(
  ({
    value = 0,
    isIndeterminate = false,
    size = 'md',
    color = 'primary',
    className = '',
    label,
    showValueLabel = false,
  }) => {
    const shouldReduceMotion = useReducedMotion();
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const colorClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      default: 'bg-border-strong',
    };

    const safeValue = Math.min(Math.max(value, 0), 100);

    return (
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        {(label || showValueLabel) && (
          <div className="flex justify-between items-center text-xs text-text-secondary">
            {label && <span>{label}</span>}
            {showValueLabel && !isIndeterminate && <span>{safeValue}%</span>}
          </div>
        )}

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isIndeterminate ? undefined : safeValue}
          aria-label={label || 'Progress'}
          className={`relative w-full overflow-hidden bg-border-subtle rounded-full ${sizeClasses[size]}`}
        >
          {isIndeterminate ? (
            <motion.div
              className={`absolute top-0 bottom-0 left-0 rounded-full w-1/2 ${colorClasses[color]}`}
              animate={shouldReduceMotion ? { left: '25%' } : { left: ['-50%', '100%'] }}
              transition={
                shouldReduceMotion
                  ? reducedMotionTransition
                  : {
                      duration: 1.8,
                      ease: [0.65, 0, 0.35, 1],
                      repeat: Infinity,
                    }
              }
            />
          ) : (
            <motion.div
              className={`absolute top-0 bottom-0 left-0 rounded-full ${colorClasses[color]}`}
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{ width: `${safeValue}%` }}
              transition={shouldReduceMotion ? reducedMotionTransition : easeSmooth}
            />
          )}
        </div>
      </div>
    );
  },
);
