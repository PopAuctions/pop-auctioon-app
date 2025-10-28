import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
}: {
  initialValue?: Partial<HighestBidderState>;
}): HighestBidderContextProps {
  const context = useContext(HighestBidderContext);

  if (!context) {
    throw new Error('useHighestBidderContext must be used within a Provider');
  }

  const { state, setState } = context;

  useEffect(() => {
    if (initialValue) {
      setState(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, setState };
}
