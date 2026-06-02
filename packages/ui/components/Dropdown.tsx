'use client';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  useListNavigation,
  FloatingFocusManager,
  FloatingList,
  useClick,
} from '@floating-ui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import React, { useId, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { easeSmooth, motionTokens, reducedMotionTransition } from '../utils/animations';

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
  displayLabel?: string;
  icon?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}

export const Dropdown = memo(function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  width = 'w-full',
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [floatingWidth, setFloatingWidth] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const listboxId = useId();

  const { refs, floatingStyles, context, placement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects }) {
          // Sync the dropdown menu width to match the trigger button exactly, accounting for sub-pixel differences.
          setFloatingWidth((prev) =>
            Math.abs(prev - rects.reference.width) > 1 ? rects.reference.width : prev,
          );
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, { enabled: !disabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'listbox' });
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
  ]);

  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : placeholder;
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  // Adjust the entry animation depending on whether Floating UI flipped the dropdown upwards or downwards.
  const isTop = placement.startsWith('top');
  const yOffset = isTop ? 10 : -10;
  const transformOrigin = isTop ? 'bottom center' : 'top center';
  const dropdownTransition = shouldReduceMotion ? reducedMotionTransition : motionTokens.expressive;
  const iconTransition = shouldReduceMotion ? reducedMotionTransition : easeSmooth;

  return (
    <div className={`relative ${width}`}>
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          'aria-expanded': isOpen,
          'aria-haspopup': 'listbox',
          'aria-controls': isOpen ? listboxId : undefined,
        })}
        type="button"
        disabled={disabled}
        className="flex items-center justify-between w-full h-9 px-3 text-[13px] font-medium bg-bg-surface border border-border-strong rounded-[var(--radius-md)] text-text-primary cursor-pointer outline-none transition-all hover:border-primary/60 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong"
        style={{ transform: 'none' }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption?.icon && (
            <img
              src={selectedOption.icon}
              className="w-4 h-4 object-contain flex-shrink-0"
              alt=""
            />
          )}
          <span className="truncate">{selectedLabel}</span>
        </div>
        <motion.div
          initial={false}
          animate={{ rotate: shouldReduceMotion ? 0 : isOpen ? 180 : 0 }}
          transition={iconTransition}
          className="flex-shrink-0 text-text-muted"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {portalRoot
        ? createPortal(
            <AnimatePresence>
              {isOpen && (
                <FloatingFocusManager context={context} modal={false}>
                  <div
                    ref={refs.setFloating}
                    id={listboxId}
                    style={{ ...floatingStyles, width: floatingWidth || undefined, zIndex: 9999 }}
                    {...getFloatingProps()}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: yOffset, scale: 0.98 }}
                      transition={dropdownTransition}
                      style={{ maxHeight: '300px', transformOrigin }}
                      className="flex flex-col rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface shadow-floating overflow-y-auto p-1 gap-0.5"
                    >
                      <FloatingList elementsRef={listRef}>
                        {options.map((opt, index) => {
                          const isSelected = value === opt.value;
                          const isActive = activeIndex === index;
                          return (
                            <button
                              key={opt.value}
                              ref={(node) => {
                                listRef.current[index] = node;
                              }}
                              role="option"
                              aria-selected={isSelected}
                              tabIndex={isActive ? 0 : -1}
                              {...getItemProps({
                                onClick: () => {
                                  onChange(opt.value);
                                  setIsOpen(false);
                                },
                                onKeyDown(event) {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onChange(opt.value);
                                    setIsOpen(false);
                                  }
                                },
                              })}
                              className={`w-full flex items-center justify-between text-left px-2 py-1.5 text-[13px] rounded-[var(--radius-sm)] outline-none transition-colors ${
                                isActive ? 'bg-bg-elevated' : ''
                              } ${
                                isSelected
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-text-primary hover:bg-bg-elevated'
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {opt.icon && (
                                  <img
                                    src={opt.icon}
                                    className="w-4 h-4 object-contain flex-shrink-0"
                                    alt=""
                                  />
                                )}
                                <span className="truncate">{opt.label}</span>
                              </div>
                              {isSelected && (
                                <Check size={14} className="flex-shrink-0 opacity-100" />
                              )}
                            </button>
                          );
                        })}
                      </FloatingList>
                    </motion.div>
                  </div>
                </FloatingFocusManager>
              )}
            </AnimatePresence>,
            portalRoot,
          )
        : null}
    </div>
  );
});
