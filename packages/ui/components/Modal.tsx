'use client';
// Fully animated modal overlay.
// Always manage the isOpen state in the parent component. AnimatePresence handles the smooth exit transition when unmounting.

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { backdropVariants, modalVariants, reducedMotionTransition } from '../utils/animations';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  children,
  size = 'md',
  ariaLabel,
  ariaLabelledBy,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  useEffect(() => {
    if (!portalRoot) return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, portalRoot]);

  useEffect(() => {
    if (!portalRoot || !isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? modalRef.current)?.focus();
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (!closeOnEscape) return;
        onOpenChange(false);
        return;
      }

      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((node) => !node.hasAttribute('disabled') && node.tabIndex !== -1);

      if (focusable.length === 0) {
        e.preventDefault();
        modalRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      previousFocusRef.current?.focus?.();
    };
  }, [closeOnEscape, isOpen, onOpenChange, portalRoot]);

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={backdropVariants}
            initial={shouldReduceMotion ? { opacity: 0 } : 'hidden'}
            animate={shouldReduceMotion ? { opacity: 1 } : 'show'}
            exit={shouldReduceMotion ? { opacity: 0 } : 'exit'}
            transition={shouldReduceMotion ? reducedMotionTransition : undefined}
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={(event) => {
              event.stopPropagation();
              if (closeOnBackdrop) onOpenChange(false);
            }}
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : 'Dialog')}
            aria-labelledby={ariaLabelledBy}
            tabIndex={-1}
            variants={modalVariants}
            initial={shouldReduceMotion ? { opacity: 0 } : 'hidden'}
            animate={shouldReduceMotion ? { opacity: 1 } : 'show'}
            exit={shouldReduceMotion ? { opacity: 0 } : 'exit'}
            transition={shouldReduceMotion ? reducedMotionTransition : undefined}
            className={[
              'relative w-full',
              sizeClasses[size],
              'bg-bg-surface border border-border-subtle rounded-[var(--radius-lg)]',
              'shadow-floating flex flex-col max-h-[90vh] overflow-hidden',
            ].join(' ')}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return portalRoot ? createPortal(content, portalRoot) : null;
};

export const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`flex flex-col w-full h-full overflow-hidden ${className}`}>{children}</div>;

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`flex shrink-0 items-center px-6 py-5 text-lg font-semibold text-text-primary ${className}`}
  >
    {children}
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`flex-1 overflow-y-auto px-6 pb-6 text-text-secondary ${className}`}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`flex shrink-0 items-center justify-end gap-2 px-6 py-4 border-t border-border-subtle ${className}`}
  >
    {children}
  </div>
);
