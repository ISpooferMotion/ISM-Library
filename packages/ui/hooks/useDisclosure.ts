import { useState, useCallback } from 'react';

export interface UseDisclosureProps {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (isOpen: boolean) => void;
}

export function useDisclosure(props: UseDisclosureProps = {}) {
  const [isOpen, setIsOpen] = useState(props.defaultIsOpen || false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    props.onOpen?.();
    props.onChange?.(true);
  }, [props]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    props.onClose?.();
    props.onChange?.(false);
  }, [props]);

  const onToggle = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  }, [isOpen, onOpen, onClose]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  };
}
