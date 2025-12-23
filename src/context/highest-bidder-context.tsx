import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { HighestBidderState } from '@/types/types';

interface HighestBidderContextProps {
  state: HighestBidderState;
  setState: (update: Partial<HighestBidderState>) => void;
}

const HighestBidderContext = createContext<
  HighestBidderContextProps | undefined
>(undefined);

export function HighestBidderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HighestBidderState>({
    highestBidder: null,
    highestBidderImage: null,
    currentValue: 0,
    available: true,
  });

  const updateState = useCallback((update: Partial<HighestBidderState>) => {
    setState((prevState) => {
      const shouldUpdate = Object.entries(update).some(
        ([key, value]) => value !== prevState[key as keyof HighestBidderState]
      );

      return shouldUpdate ? { ...prevState, ...update } : prevState;
    });
  }, []);

  const value = useMemo(
    () => ({ state, setState: updateState }),
    [state, updateState]
  );

  return (
    <HighestBidderContext.Provider value={value}>
      {children}
    </HighestBidderContext.Provider>
  );
}

/**
 * Custom hook that optionally accepts initial values
 * These values are only set when the hook is first mounted.
 */
export function useHighestBidderContext({
  initialValue,
  resetKey,
}: {
  initialValue?: Partial<HighestBidderState>;
  resetKey?: number | string;
} = {}): HighestBidderContextProps {
  const context = useContext(HighestBidderContext);

  if (!context) {
    throw new Error('useHighestBidderContext must be used within a Provider');
  }

  const { state, setState } = context;

  // tracks which key has been hydrated
  const hydratedKeyRef = useRef<number | string | null>(null);

  // If resetKey changes, mark as not hydrated (but only when resetKey is being used)
  useEffect(() => {
    if (resetKey == null) return;
    hydratedKeyRef.current = null;
  }, [resetKey]);

  // Hydrate exactly once per resetKey, when initialValue is available (even if it arrives later)
  useEffect(() => {
    if (resetKey == null) return;
    if (!initialValue) return;

    if (hydratedKeyRef.current === resetKey) return;

    setState(initialValue);
    hydratedKeyRef.current = resetKey;
  }, [resetKey, initialValue, setState]);

  return { state, setState };
}
