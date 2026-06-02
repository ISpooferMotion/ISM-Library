'use client';
// Floating tooltip powered by Floating UI and Framer Motion for smooth entry animations.

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import React, { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { motionTokens, reducedMotionTransition } from '../utils/animations';

import {
  useFloating,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useInteractions,
  Placement,
} from '@floating-ui/react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  side?: Placement;
}

export const Tooltip = React.memo(function Tooltip({
  content,
  children,
  side = 'top',
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const tooltipId = useId();
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  const { refs, floatingStyles, context, placement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: side,
    middleware: [offset(8), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 8 })],
  });

  const hover = useHover(context, { delay: { open: 0, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss]);

  const isTop = placement.startsWith('top');
  const isBottom = placement.startsWith('bottom');
  const isLeft = placement.startsWith('left');
  const isRight = placement.startsWith('right');

  // Adjust animation offsets based on which side Floating UI actually placed the tooltip.
  const yOffset = isTop ? 4 : isBottom ? -4 : 0;
  const xOffset = isLeft ? 4 : isRight ? -4 : 0;
  const transformOrigin = isTop
    ? 'bottom center'
    : isBottom
      ? 'top center'
      : isLeft
        ? 'center right'
        : 'center left';
  const tooltipTransition = shouldReduceMotion ? reducedMotionTransition : motionTokens.quick;

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps({
          'aria-describedby': isOpen ? tooltipId : undefined,
          'aria-label': typeof content === 'string' ? content : 'Show tooltip',
          tabIndex: 0,
        })}
        className="relative inline-flex items-center"
        onClick={() => setIsOpen(false)}
      >
        {children}
      </span>
      {portalRoot
        ? createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  ref={refs.setFloating}
                  id={tooltipId}
                  role="tooltip"
                  style={{ ...floatingStyles, transformOrigin }}
                  {...getFloatingProps()}
                  initial={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : xOffset,
                    y: shouldReduceMotion ? 0 : yOffset,
                    scale: shouldReduceMotion ? 1 : 0.98,
                  }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : xOffset,
                    y: shouldReduceMotion ? 0 : yOffset,
                    scale: shouldReduceMotion ? 1 : 0.98,
                  }}
                  transition={tooltipTransition}
                  className="pointer-events-none fixed z-[300] w-max max-w-[280px] rounded-[var(--radius-md)] border border-border-strong bg-bg-surface px-3.5 py-2.5 text-left text-[11px] font-medium leading-5 text-text-secondary shadow-floating"
                >
                  {content}
                </motion.div>
              )}
            </AnimatePresence>,
            portalRoot,
          )
        : null}
    </>
  );
});

export const HelpTooltip = React.memo(function HelpTooltip({
  content,
}: {
  content: React.ReactNode;
}) {
  return (
    <Tooltip content={content}>
      <span
        className="inline-flex h-5 w-5 select-none items-center justify-center rounded-full text-text-muted transition-colors hover:text-primary"
        aria-hidden="true"
      >
        <CircleHelp size={13} />
      </span>
    </Tooltip>
  );
});
