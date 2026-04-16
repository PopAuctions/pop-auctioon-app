import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { useSignInAlertModal } from './sign-in-modal-context';

interface AuctionStartedModalContextValue {
  isAuctionStartedModalOpen: boolean;
  openAuctionStartedAlertModal: (id?: number) => void;
  closeAuctionStartedAlertModal: () => void;
  auctionId: number | null;
}

const AuctionStartedModalContext =
  createContext<AuctionStartedModalContextValue | null>(null);

export const AuctionStartedModalProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const { closeSignInAlertModal } = useSignInAlertModal();
  const [isAuctionStartedModalOpen, setIsAuctionStartedModalOpen] =
    useState(false);
  const [auctionId, setAuctionId] = useState<number | null>(null);

  const openAuctionStartedAlertModal = useCallback(
    (id?: number) => {
      closeSignInAlertModal();
      setAuctionId(id ?? null);
      setIsAuctionStartedModalOpen(true);
    },
    [closeSignInAlertModal]
  );

  const closeAuctionStartedAlertModal = useCallback(() => {
    setAuctionId(null);
    setIsAuctionStartedModalOpen(false);
  }, []);

  const value = useMemo<AuctionStartedModalContextValue>(
    () => ({
      isAuctionStartedModalOpen,
      openAuctionStartedAlertModal,
      closeAuctionStartedAlertModal,
      auctionId,
    }),
    [
      isAuctionStartedModalOpen,
      openAuctionStartedAlertModal,
      closeAuctionStartedAlertModal,
      auctionId,
    ]
  );

  return (
    <AuctionStartedModalContext.Provider value={value}>
      {children}
    </AuctionStartedModalContext.Provider>
  );
};

export const useAuctionStartedModal = (): AuctionStartedModalContextValue => {
  const context = useContext(AuctionStartedModalContext);
  if (!context)
    throw new Error(
      'useAuctionStartedModal must be used within <AuctionStartedModalProvider>'
    );
  return context;
};
