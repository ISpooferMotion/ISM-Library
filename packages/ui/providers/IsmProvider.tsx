'use client';
import React, { createContext, useContext, useMemo } from 'react';

export interface IsmConfig {
  autoScrollAccordions?: boolean;
  smoothScrolling?: boolean;
  smoothTyping?: boolean;
  // future library config properties can be added here
}

type ResolvedIsmConfig = Required<IsmConfig>;

const defaultIsmConfig: ResolvedIsmConfig = {
  autoScrollAccordions: true,
  smoothScrolling: true,
  smoothTyping: true,
};

const IsmContext = createContext<ResolvedIsmConfig>(defaultIsmConfig);

export const IsmProvider: React.FC<{
  config?: IsmConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const mergedConfig = useMemo(() => ({ ...defaultIsmConfig, ...config }), [config]);
  return <IsmContext.Provider value={mergedConfig}>{children}</IsmContext.Provider>;
};

export const useIsmConfig = () => useContext(IsmContext);
