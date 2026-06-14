'use client';
// A multi-select variant of the Dropdown.
// It stays open after clicking an option so users don't have to keep reopening it.

import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useThemeAccent } from '../theme/ThemeProvider';
import { getAutoContrastColor } from '../utils/colors';
import {
  dropdownVariants,
  easeFast,
  easeSmooth,
  reducedMotionTransition,
  springSnappy,
} from '../utils/animations';
import { DropdownOption } from './Dropdown';

interface MultiSelectDropdownProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: DropdownOption[];
  placeholder?: string;
  width?: string;
}

export function MultiSelectToggle({
  checked,
  indeterminate = false,
  className = '',
}: {
  checked: boolean;
  indeterminate?: boolean;
  className?: string;
}) {
  const { accentColor } = useThemeAccent();
  const accentContrastColor = getAutoContrastColor(accentColor);
  const isActive = checked || indeterminate;

  return (
    <div
      className={`w-[18px] h-[18px] shrink-0 rounded-[4px] border-2 transition-colors flex items-center justify-center ${
        isActive ? 'bg-primary border-primary' : 'bg-bg-base border-border-strong'
      } ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isActive && (
          <motion.svg
            key={indeterminate ? 'indeterminate' : 'checked'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springSnappy}
            className="w-3 h-3"
            style={{ color: accentContrastColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={indeterminate ? 'M5 12h14' : 'M5 13l4 4L19 7'}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MultiSelectDropdown({
  values = [],
  onChange,
  options,
  placeholder = 'Select...',
  width = 'w-full',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const listboxId = useId();

  const selectedLabels = values
    .map((v) => {
      const opt = options.find((o) => o.value === v);
      return opt?.displayLabel ?? (typeof opt?.label === 'string' ? opt.label : null);
    })
    .filter(Boolean)
    .join(', ');

  const displayLabel =
    values.length === options.length ? 'All' : values.length > 0 ? selectedLabels : placeholder;
  const hasSelection = values.length > 0;
  const portalRoot = typeof document !== 'undefined' ? document.body : null;
  const iconTransition = shouldReduceMotion ? reducedMotionTransition : easeSmooth;
  const { x, y, strategy, refs } = useFloating({
    open: isOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          if (elements.floating) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          }
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        refs.reference.current &&
        !(refs.reference.current as HTMLElement).contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, refs.reference]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Toggle the option in the array while intentionally keeping the menu open.
  const toggleOption = (optValue: string) => {
    if (values.includes(optValue)) {
      onChange(values.filter((v) => v !== optValue));
    } else {
      onChange([...values, optValue]);
    }
  };

  return (
    <div
      className={`relative min-w-0 max-w-full ${width}`}
      ref={refs.setReference as React.RefCallback<HTMLDivElement>}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex min-w-0 items-center justify-between w-full h-9 px-3 text-[13px] font-medium bg-bg-surface border border-border-strong rounded-[var(--radius-md)] text-text-primary cursor-pointer outline-none transition-all hover:border-primary/60 shadow-sm"
        style={{ transform: 'none' }}
      >
        <div className="min-w-0 flex-1 overflow-hidden flex items-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={displayLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={easeFast}
              className={`truncate pr-2 ${hasSelection ? 'text-text-primary' : 'text-text-muted'}`}
            >
              {displayLabel}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.div
          initial={false}
          animate={{ rotate: shouldReduceMotion ? 0 : isOpen ? 180 : 0 }}
          transition={iconTransition}
          className="flex-shrink-0 text-text-muted ml-2"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {portalRoot
        ? createPortal(
            <AnimatePresence>
              {isOpen && (
                <div
                  id={listboxId}
                  role="listbox"
                  aria-multiselectable="true"
                  ref={(el) => {
                    dropdownRef.current = el;
                    refs.setFloating(el);
                  }}
                  className="z-[9999]"
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    position: strategy,
                    top: y ?? 0,
                    left: x ?? 0,
                    visibility: x == null ? 'hidden' : 'visible',
                  }}
                >
                  <motion.div
                    variants={shouldReduceMotion ? undefined : dropdownVariants}
                    initial={shouldReduceMotion ? { opacity: 0 } : 'hidden'}
                    animate={shouldReduceMotion ? { opacity: 1 } : 'show'}
                    exit={shouldReduceMotion ? { opacity: 0 } : 'exit'}
                    transition={shouldReduceMotion ? reducedMotionTransition : undefined}
                    className="flex flex-col rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface shadow-floating p-1 gap-0.5"
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {options.map((opt) => {
                      const isSelected = values.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => toggleOption(opt.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleOption(opt.value);
                            }
                          }}
                          className={`group w-full flex items-center gap-3 text-left px-2 py-1.5 rounded-[var(--radius-sm)] text-[13px] outline-none transition-colors ${
                            isSelected
                              ? 'text-primary bg-primary/5 hover:bg-primary/10'
                              : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                          }`}
                        >
                          <MultiSelectToggle checked={isSelected} />
                          {opt.icon && (
                            <img
                              src={opt.icon}
                              className={`w-4 h-4 object-contain flex-shrink-0 transition-all duration-200 ${
                                isSelected
                                  ? ''
                                  : 'opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0'
                              }`}
                              alt=""
                            />
                          )}
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            portalRoot,
          )
        : null}
    </div>
  );
}
