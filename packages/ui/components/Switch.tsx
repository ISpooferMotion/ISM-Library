'use client';
// A slick iOS-style toggle switch.
// The thumb circle glides smoothly between states using framer-motion.

import { motion, useReducedMotion } from 'framer-motion';
import React, { memo } from 'react';
import { reducedMotionTransition, springSnappy } from '../utils/animations';

interface SettingsSwitchProps {
  label: string | React.ReactNode;
  description?: string | React.ReactNode;
  isSelected?: boolean;
  defaultSelected?: boolean;
  onValueChange?: (isSelected: boolean) => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default';
  fullWidth?: boolean;
}

export const Switch = memo(function Switch({
  label,
  description,
  isSelected,
  defaultSelected,
  onValueChange,
  color = 'primary',
  fullWidth = true,
}: SettingsSwitchProps) {
  const [internal, setInternal] = React.useState(defaultSelected ?? false);
  const shouldReduceMotion = useReducedMotion();
  const reactId = React.useId();
  const labelId = `ism-switch-label-${reactId}`;
  const descriptionId = `ism-switch-description-${reactId}`;
  const checked = isSelected !== undefined ? isSelected : internal;

  const toggle = () => {
    if (isSelected === undefined) setInternal((v) => !v);
    onValueChange?.(!checked);
  };
  const activeColorClass = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    default: 'bg-text-primary',
  }[color];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={toggle}
      className={[
        'flex items-center py-1.5 cursor-pointer group',
        fullWidth ? 'justify-between w-full' : 'gap-4 w-fit',
        'appearance-none bg-transparent text-left outline-none rounded-md transition-colors duration-100',
        'active:!scale-100',
      ].join(' ')}
    >
      <div className="flex flex-col select-none mr-4">
        <span
          id={labelId}
          className={`text-sm font-medium transition-colors duration-100 ${checked ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}
        >
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-[11px] text-text-muted leading-relaxed mt-0.5">
            {description}
          </span>
        )}
      </div>

      <motion.div
        className={`relative w-9 h-5 rounded-full shrink-0 p-0.5 transition-colors duration-200 ${
          checked ? activeColorClass : 'bg-border-strong'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 16 : 0 }}
          transition={shouldReduceMotion ? reducedMotionTransition : springSnappy}
          className="w-4 h-4 rounded-full bg-bg-base shadow-sm"
        />
      </motion.div>
    </button>
  );
});
