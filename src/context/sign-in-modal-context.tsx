import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';

interface SignInAlertModalContextValue {
  isSignInAlertModalOpen: boolean;
  openSignInAlertModal: () => void;
  closeSignInAlertModal: () => void;
}

const SignInAlertModalContext =
  createContext<SignInAlertModalContextValue | null>(null);

export const SignInAlertModalProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [isSignInAlertModalOpen, setIsSignInAlertModalOpen] = useState(false);

  const openSignInAlertModal = useCallback(() => {
    setIsSignInAlertModalOpen(true);
  }, []);

  const closeSignInAlertModal = useCallback(() => {
    setIsSignInAlertModalOpen(false);
  }, []);

  const value = useMemo<SignInAlertModalContextValue>(
    () => ({
      isSignInAlertModalOpen,
      openSignInAlertModal,
      closeSignInAlertModal,
    }),
    [isSignInAlertModalOpen, openSignInAlertModal, closeSignInAlertModal]
  );

  return (
    <SignInAlertModalContext.Provider value={value}>
      {children}
    </SignInAlertModalContext.Provider>
  );
};

export const useSignInAlertModal = (): SignInAlertModalContextValue => {
  const context = useContext(SignInAlertModalContext);
  if (!context)
    throw new Error(
      'useSignInAlertModal must be used within <SignInAlertModalProvider>'
    );
  return context;
};
