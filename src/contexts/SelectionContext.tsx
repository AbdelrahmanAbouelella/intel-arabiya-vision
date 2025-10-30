import React, { createContext, useContext, useMemo, useState } from 'react';

type SelectionContextType = {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const value = useMemo(() => ({ selectedIds, setSelectedIds }), [selectedIds]);
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}

