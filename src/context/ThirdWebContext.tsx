import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// ThirdWeb wallet types for 500+ wallet support
declare global {
  interface Window {
    ethereum?: any;
    trustWallet?: any;
    coinbaseWalletExtension?: any;
    phantom?: any;
    solana?: any;
  }
}

// Contract configuration - Real Mainnet Contracts
const MLM_CONTRACT_ADDRESS = '0xba3dd671da7e1427bc401ec9d1ebb96d8e7f4853';
const BSC_MAINNET_CHAIN_ID = 56;

// Contract ABI for the MLM contract
const MLM_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "checkIfRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "directReferrals",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllRegistered",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getDirectReferralCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getDirectReferrals",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getReferrerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "referrerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "registeredUsers",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRegistered",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface ThirdWebContextType {
  address: string | null;
  isConnected: boolean;
  isMLMRegistered: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  registerMLM: (referrerAddress?: string) => Promise<boolean>;
  checkMLMRegistration: () => Promise<boolean>;
  getDirectReferrals: () => Promise<string[]>;
  getDirectReferralCount: () => Promise<number>;
  getReferrer: () => Promise<string>;
  switchToCorrectNetwork: () => Promise<void>;
  isCorrectNetwork: boolean;
  getAvailableWallets: () => string[];
}

const ThirdWebContext = createContext<ThirdWebContextType | undefined>(undefined);

interface ThirdWebProviderProps {
  children: ReactNode;
}

export const ThirdWebProvider: React.FC<ThirdWebProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMLMRegistered, setIsMLMRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if wallet is connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Check connection status
  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await checkNetwork();
          await checkMLMRegistration();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  // Check if on correct network
  const checkNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainId, 16);
        setIsCorrectNetwork(currentChainId === BSC_MAINNET_CHAIN_ID);
      } catch (error) {
        console.error('Error checking network:', error);
        setIsCorrectNetwork(false);
      }
    }
  };

  // Connect wallet with enhanced detection
  const connectWallet = async () => {
    if (typeof window !== 'undefined') {
      try {
        setIsLoading(true);

        let provider = null;

        // Try different wallet providers
        if (window.ethereum) {
          provider = window.ethereum;
        } else if (window.trustWallet) {
          provider = window.trustWallet;
        } else if (window.coinbaseWalletExtension) {
          provider = window.coinbaseWalletExtension;
        } else {
          throw new Error('No Web3 wallet detected. Please install MetaMask, Trust Wallet, or another Web3 wallet.');
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await checkNetwork();
          await checkMLMRegistration();
        }
      } catch (error: any) {
        console.error('Error connecting wallet:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      throw new Error('Web3 not supported in this browser');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setIsMLMRegistered(false);
    setIsCorrectNetwork(false);
  };

  // Switch to correct network
  const switchToCorrectNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BSC_MAINNET_CHAIN_ID.toString(16)}` }],
        });
        await checkNetwork();
      } catch (error: any) {
        // If the chain hasn't been added to MetaMask, add it
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${BSC_MAINNET_CHAIN_ID.toString(16)}`,
                  chainName: 'BSC Mainnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://bsc-dataseed1.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com/'],
                },
              ],
            });
            await checkNetwork();
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        } else {
          console.error('Error switching network:', error);
        }
      }
    }
  };

  // Check MLM registration status
  const checkMLMRegistration = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) return false;

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, provider);

        const isRegistered = await contract.checkIfRegistered(address);
        setIsMLMRegistered(isRegistered);
        return isRegistered;
      }
      return false;
    } catch (error) {
      console.error('Error checking MLM registration:', error);
      return false;
    }
  };

  // Register for MLM
  const registerMLM = async (referrerAddress?: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork) return false;

    try {
      setIsLoading(true);

      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, signer);

        // Use zero address if no referrer provided
        const referrer = referrerAddress || '0x0000000000000000000000000000000000000000';

        const tx = await contract.register(referrer);
        await tx.wait();

        setIsMLMRegistered(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error registering MLM:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get direct referrals
  const getDirectReferrals = async (): Promise<string[]> => {
    if (!address || !isCorrectNetwork) return [];

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, provider);

        const referrals = await contract.getDirectReferrals(address);
        return referrals;
      }
      return [];
    } catch (error) {
      console.error('Error getting direct referrals:', error);
      return [];
    }
  };

  // Get direct referral count
  const getDirectReferralCount = async (): Promise<number> => {
    if (!address || !isCorrectNetwork) return 0;

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, provider);

        const count = await contract.getDirectReferralCount(address);
        return count.toNumber();
      }
      return 0;
    } catch (error) {
      console.error('Error getting referral count:', error);
      return 0;
    }
  };

  // Get referrer
  const getReferrer = async (): Promise<string> => {
    if (!address || !isCorrectNetwork) return '';

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, provider);

        const referrer = await contract.getReferrerOf(address);
        return referrer;
      }
      return '';
    } catch (error) {
      console.error('Error getting referrer:', error);
      return '';
    }
  };

  // Get available wallets
  const getAvailableWallets = (): string[] => {
    const wallets: string[] = [];

    if (typeof window !== 'undefined') {
      if (window.ethereum?.isMetaMask) wallets.push('MetaMask');
      if (window.ethereum?.isTrust || window.trustWallet) wallets.push('Trust Wallet');
      if (window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension) wallets.push('Coinbase Wallet');
      if (window.ethereum?.isOKExWallet || window.okxwallet) wallets.push('OKX Wallet');
      if (window.BinanceChain) wallets.push('Binance Chain Wallet');
      if (window.phantom) wallets.push('Phantom');
      if (window.ethereum && !wallets.length) wallets.push('Web3 Wallet');
    }

    return wallets;
  };

  const value: ThirdWebContextType = {
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
    getAvailableWallets,
  };

  return (
    <ThirdWebContext.Provider value={value}>
      {children}
    </ThirdWebContext.Provider>
  );
};

export const useThirdWeb = (): ThirdWebContextType => {
  const context = useContext(ThirdWebContext);
  if (context === undefined) {
    throw new Error('useThirdWeb must be used within a ThirdWebProvider');
  }
  return context;
};

export { MLM_CONTRACT_ADDRESS, MLM_CONTRACT_ABI, BSC_MAINNET_CHAIN_ID };
