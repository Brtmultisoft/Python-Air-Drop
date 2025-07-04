import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { useActiveAccount, useActiveWallet, useConnectedWallets, useConnect } from "thirdweb/react";
import { client, bscMainnet,MINING_CONTRACT_ADDRESS,TOKEN_CONTRACT_ADDRESS,MINING_CONTRACT_ABI } from '../client';
import { OWNER_ADDRESS } from '../config';

interface ThirdWebMLMContextType {
  address: string | null;
  isConnected: boolean;
  isMLMRegistered: boolean;
  isLoading: boolean;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  registerMLM: (referrerAddress?: string) => Promise<boolean>;
  checkMLMRegistration: () => Promise<boolean>;
  getDirectReferrals: () => Promise<readonly string[]>;
  getDirectReferralCount: () => Promise<number>;
  getReferrer: () => Promise<string>;
  switchToCorrectNetwork: () => Promise<void>;
  isCorrectNetwork: boolean;
  openConnectModal: () => void;
  refreshNetworkState: () => void;
}

const ThirdWebMLMContext = createContext<ThirdWebMLMContextType | undefined>(undefined);

interface ThirdWebMLMProviderProps {
  children: ReactNode;
}

export const ThirdWebMLMProvider: React.FC<ThirdWebMLMProviderProps> = ({ children }) => {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { connect } = useConnect();

  const [isMLMRegistered, setIsMLMRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [networkRefreshTrigger, setNetworkRefreshTrigger] = useState(0);

  const address = account?.address || null;
  const chainId = activeWallet?.getChain()?.id;
  const isConnected = !!account && !!address;

  const isCorrectNetwork = useMemo(() => {
    const isCorrect = chainId === bscMainnet.id || chainId === 94;
    return isCorrect;
  }, [chainId, address, networkRefreshTrigger]);

  const contract = getContract({
    client,
    chain: bscMainnet,
    address: MINING_CONTRACT_ADDRESS,
    abi: MINING_CONTRACT_ABI,
  });

  useEffect(() => {
    const autoReconnect = async () => {
      try {
        setIsLoading(true);

        const wasConnected = localStorage.getItem('thirdweb_wallet_connected');
        const lastWalletType = localStorage.getItem('thirdweb_wallet_type');

        if (wasConnected === 'true' && lastWalletType && !address) {
          console.log('Attempting to auto-reconnect wallet:', lastWalletType);

          const isWalletAvailable = () => {
            switch (lastWalletType) {
              case 'metamask':
                return typeof window !== 'undefined' && window.ethereum;
              case 'trust':
                return typeof window !== 'undefined' && (window.ethereum || window.trustWallet);
              case 'coinbase':
                return typeof window !== 'undefined' && (window.ethereum || window.coinbaseWalletExtension);
              default:
                return typeof window !== 'undefined' && window.ethereum;
            }
          };

          if (!isWalletAvailable()) {
            console.log('Wallet not available for auto-reconnect:', lastWalletType);
            localStorage.removeItem('thirdweb_wallet_connected');
            localStorage.removeItem('thirdweb_wallet_type');
            return;
          }

          let walletToConnect;

          switch (lastWalletType) {
            case 'metamask':
              walletToConnect = createWallet("io.metamask");
              break;
            case 'trust':
              walletToConnect = createWallet("com.trustwallet.app");
              break;
            case 'coinbase':
              walletToConnect = createWallet("com.coinbase.wallet");
              break;
            default:
              walletToConnect = createWallet("io.metamask");
          }

          await connect(async () => {
            await walletToConnect.connect({ client });
            return walletToConnect;
          });
        }
      } catch (error) {
        console.log('Auto-reconnect failed:', error);
        localStorage.removeItem('thirdweb_wallet_connected');
        localStorage.removeItem('thirdweb_wallet_type');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      autoReconnect();
    }
  }, [address, isInitialized]);

  useEffect(() => {
    if (address) {
      localStorage.setItem('thirdweb_wallet_connected', 'true');
    } else if (!address) {
      localStorage.removeItem('thirdweb_wallet_connected');
      localStorage.removeItem('thirdweb_wallet_type');
    }
  }, [address]);

  const checkMLMRegistration = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) return false;

    try {
      const isRegistered = await readContract({
        contract,
        method: "checkIfRegistered",
        params: [address],
      });
      
      setIsMLMRegistered(isRegistered);
      return isRegistered;
    } catch (error) {
      console.error('Error checking MLM registration:', error);
      return false;
    }
  };

  const registerMLM = async (referrerAddress?: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork || !account) return false;

    try {
      setIsLoading(true);

      const referrer = referrerAddress || OWNER_ADDRESS;

      const transaction = prepareContractCall({
        contract,
        method: "register",
        params: [referrer],
      });

      await sendTransaction({
        transaction,
        account: account,
      });

      setIsMLMRegistered(true);
      return true;
    } catch (error) {
      console.error('Error registering MLM:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDirectReferrals = async (): Promise<readonly string[]> => {
    if (!address || !isCorrectNetwork) return [];

    try {
      const referrals = await readContract({
        contract,
        method: "getDirectReferrals",
        params: [address],
      });

      return referrals;
    } catch (error) {
      console.error('Error getting direct referrals:', error);
      return [];
    }
  };

  const getDirectReferralCount = async (): Promise<number> => {
    if (!address || !isCorrectNetwork) return 0;

    try {
      const count = await readContract({
        contract,
        method: "getDirectReferralCount",
        params: [address],
      });
      
      return Number(count);
    } catch (error) {
      console.error('Error getting referral count:', error);
      return 0;
    }
  };

  const getReferrer = async (): Promise<string> => {
    if (!address || !isCorrectNetwork) return '';

    try {
      const referrer = await readContract({
        contract,
        method: "getReferrerOf",
        params: [address],
      });
      
      return referrer;
    } catch (error) {
      console.error('Error getting referrer:', error);
      return '';
    }
  };

  const connectWallet = async (walletType: string = 'metamask') => {
    try {
      setIsLoading(true);

      let walletToConnect;

      switch (walletType) {
        case 'trust':
          walletToConnect = createWallet("com.trustwallet.app");
          break;
        case 'coinbase':
          walletToConnect = createWallet("com.coinbase.wallet");
          break;
        case 'metamask':
        default:
          walletToConnect = createWallet("io.metamask");
          break;
      }

      await connect(async () => {
        await walletToConnect.connect({ client });
        return walletToConnect;
      });

      localStorage.setItem('thirdweb_wallet_type', walletType);
      localStorage.setItem('thirdweb_wallet_connected', 'true');

    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const openConnectModal = () => {
    console.log('Opening connect modal...');
  };

  const refreshNetworkState = () => {
    console.log('Manually refreshing network state...');
    setNetworkRefreshTrigger(prev => prev + 1);

    setTimeout(() => {
      if (isConnected && isCorrectNetwork) {
        console.log('Re-checking MLM registration after network refresh...');
        checkMLMRegistration();
      }
    }, 500);
  };

  const disconnectWallet = () => {
    setIsMLMRegistered(false);

    localStorage.removeItem('thirdweb_wallet_connected');
    localStorage.removeItem('thirdweb_wallet_type');
    console.log('Wallet disconnected and storage cleared');
  };

  const switchToCorrectNetwork = async () => {
    try {
      if (activeWallet) {
        await activeWallet.switchChain(bscMainnet);
        setTimeout(() => {
          refreshNetworkState();
        }, 1000);
      } else {
        throw new Error('No active wallet available');
      }
    } catch (error) {
      throw new Error('Failed to switch to BSC Mainnet. Please switch manually in your wallet.');
    }
  };

  useEffect(() => {
    console.log('ThirdWebMLM Context state:', {
      isConnected,
      isCorrectNetwork,
      address,
      chainId: chainId,
      walletConnected: !!activeWallet
    });

    if (isConnected && isCorrectNetwork) {
      console.log('Checking MLM registration...');
      checkMLMRegistration();
    } else {
      setIsMLMRegistered(false);
    }
  }, [isConnected, isCorrectNetwork, address, chainId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId, 'Expected:', '0x38');

        refreshNetworkState();

        setTimeout(() => {
          if (isConnected) {
            checkMLMRegistration();
          }
        }, 1000);
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  const value: ThirdWebMLMContextType = {
    address,
    isConnected,
    isMLMRegistered,
    isLoading,
    connectWallet,
    disconnectWallet,
    registerMLM,
    checkMLMRegistration,
    getDirectReferrals,
    getDirectReferralCount,
    getReferrer,
    switchToCorrectNetwork,
    isCorrectNetwork,
    openConnectModal,
    refreshNetworkState,
  };

  return (
    <ThirdWebMLMContext.Provider value={value}>
      {children}
    </ThirdWebMLMContext.Provider>
  );
};

export const useThirdWebMLM = (): ThirdWebMLMContextType => {
  const context = useContext(ThirdWebMLMContext);
  if (context === undefined) {
    throw new Error('useThirdWebMLM must be used within a ThirdWebMLMProvider');
  }
  return context;
};

export { bscMainnet, MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI };
