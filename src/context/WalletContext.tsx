import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { getProvider, checkIfRegistered } from '../services/contractService';
import { checkNetwork, switchNetwork } from '../utils/networkUtils';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToCorrectNetwork: () => Promise<boolean>;
  refreshRegistrationStatus: () => Promise<boolean>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnected: false,
  isRegistered: false,
  isCorrectNetwork: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchToCorrectNetwork: async () => false,
  refreshRegistrationStatus: async () => false,
  loading: false,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const switchToCorrectNetwork = async (): Promise<boolean> => {
    try {
      const isCorrect = await checkNetwork();
      setIsCorrectNetwork(isCorrect);

      if (!isCorrect) {
        const switched = await switchNetwork();
        setIsCorrectNetwork(switched);
        return switched;
      }

      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        // Check if on correct network
        const networkCorrect = await switchToCorrectNetwork();

        if (networkCorrect) {
          // Check if the user is registered
          const registered = await checkIfRegistered(accounts[0]);
          setIsRegistered(registered);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsRegistered(false);
  };

  // Function to refresh registration status
  const refreshRegistrationStatus = async (): Promise<boolean> => {
    if (!account) return false;

    try {
      console.log('Refreshing registration status for account:', account);
      const registered = await checkIfRegistered(account);
      console.log('Updated registration status:', registered);
      setIsRegistered(registered);
      return registered;
    } catch (error) {
      console.error('Error refreshing registration status:', error);
      return false;
    }
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          setLoading(true);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);

            // Check if on correct network
            const networkCorrect = await checkNetwork();
            setIsCorrectNetwork(networkCorrect);

            if (networkCorrect) {
              try {
                // Check if the user is registered
                console.log('Checking if user is registered:', accounts[0]);
                const registered = await checkIfRegistered(accounts[0]);
                console.log('User registration status:', registered);
                setIsRegistered(registered);
              } catch (regError) {
                console.error('Error checking registration status:', regError);
                // Default to false if there's an error
                setIsRegistered(false);
              }
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);

          try {
            // Check if the new account is registered
            console.log('Account changed, checking if registered:', accounts[0]);
            const registered = await checkIfRegistered(accounts[0]);
            console.log('New account registration status:', registered);
            setIsRegistered(registered);
          } catch (error) {
            console.error('Error checking registration for new account:', error);
            setIsRegistered(false);
          }
        } else {
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isRegistered,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchToCorrectNetwork,
        refreshRegistrationStatus,
        loading
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
