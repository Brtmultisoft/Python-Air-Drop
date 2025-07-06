import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount, useActiveWallet, useConnect } from "thirdweb/react";
import { client, bscTestnet, MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI } from '../client';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UserRecord {
  totalMinted: bigint;
  isExists: boolean;
  boosterIncome: bigint;
  lastClaimTime: bigint;
}

interface MiningContextType {
  address: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  userRecord: UserRecord | null;
  dailyReward: bigint;
  regReward: bigint;
  directReferrals: readonly string[];
  directReferralCount: number;
  referrer: string;
  totalRegistered: number;
  canClaim: boolean;
  timeUntilNextClaim: number;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  register: (referrerAddress?: string) => Promise<boolean>;
  claimDailyReward: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  switchToCorrectNetwork: () => Promise<void>;
  isCorrectNetwork: boolean;
}

const MiningContext = createContext<MiningContextType | undefined>(undefined);

interface MiningProviderProps {
  children: ReactNode;
}

export const MiningProvider: React.FC<MiningProviderProps> = ({ children }) => {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { connect } = useConnect();

  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [dailyReward, setDailyReward] = useState<bigint>(0n);
  const [regReward, setRegReward] = useState<bigint>(0n);
  const [directReferrals, setDirectReferrals] = useState<readonly string[]>([]);
  const [directReferralCount, setDirectReferralCount] = useState(0);
  const [referrer, setReferrer] = useState('');
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0);

  const address = account?.address || null;
  const chainId = activeWallet?.getChain()?.id;
  const isConnected = !!account && !!address;

  const isCorrectNetwork = useMemo(() => {
    return chainId === bscTestnet.id || chainId === 97;
  }, [chainId]);

  const contract = getContract({
    client,
    chain: bscTestnet,
    address: MINING_CONTRACT_ADDRESS,
    abi: MINING_CONTRACT_ABI,
  });

  // Calculate if user can claim
  const canClaim = useMemo(() => {
    if (!userRecord || !isRegistered) return false;
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = Number(userRecord.lastClaimTime);
    const timeDiff = now - lastClaim;
    return timeDiff >= 120; // 2 minutes for testing (change to 86400 for 24 hours)
  }, [userRecord, isRegistered]);

  // Update countdown timer
  useEffect(() => {
    if (!userRecord || !isRegistered) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastClaim = Number(userRecord.lastClaimTime);
      const nextClaimTime = lastClaim + 120; // 2 minutes for testing
      const timeLeft = Math.max(0, nextClaimTime - now);
      setTimeUntilNextClaim(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userRecord, isRegistered]);

  const checkRegistration = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork) return false;

    try {
      const registered = await readContract({
        contract,
        method: "checkIfRegistered",
        params: [address],
      });
      
      setIsRegistered(registered);
      return registered;
    } catch (error) {
      console.error('Error checking registration:', error);
      return false;
    }
  };

  const fetchUserRecord = async () => {
    if (!address || !isCorrectNetwork) return;

    try {
      const record = await readContract({
        contract,
        method: "userRecord",
        params: [address],
      });
      
      setUserRecord({
        totalMinted: record[0],
        isExists: record[1],
        boosterIncome: record[2],
        lastClaimTime: record[3],
      });
    } catch (error) {
      console.error('Error fetching user record:', error);
    }
  };

  const fetchContractData = async () => {
    try {
      const [daily, reg, total] = await Promise.all([
        readContract({ contract, method: "DAILY_REWARD", params: [] }),
        readContract({ contract, method: "REG_REWARD", params: [] }),
        readContract({ contract, method: "totalRegistered", params: [] }),
      ]);

      setDailyReward(daily);
      setRegReward(reg);
      setTotalRegistered(Number(total));
    } catch (error) {
      console.error('Error fetching contract data:', error);
    }
  };

  const fetchReferralData = async () => {
    if (!address || !isCorrectNetwork) return;

    try {
      const [referrals, count, ref] = await Promise.all([
        readContract({ contract, method: "getDirectReferrals", params: [address] }),
        readContract({ contract, method: "getDirectReferralCount", params: [address] }),
        readContract({ contract, method: "getReferrerOf", params: [address] }),
      ]);

      setDirectReferrals(referrals);
      setDirectReferralCount(Number(count));
      setReferrer(ref);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const register = async (referrerAddress?: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork || !account) return false;

    try {
      setIsLoading(true);

      const referrer = referrerAddress || '0x0000000000000000000000000000000000000000';

      const transaction = prepareContractCall({
        contract,
        method: "register",
        params: [referrer as `0x${string}`],
      });

      await sendTransaction({
        transaction,
        account: account,
      });

      // Set registration status immediately
      setIsRegistered(true);
      
      // Refresh data in the background without blocking
      setTimeout(async () => {
        try {
          await refreshData();
        } catch (error) {
          console.error('Error refreshing data after registration:', error);
        }
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error registering:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const claimDailyReward = async (): Promise<boolean> => {
    if (!address || !isCorrectNetwork || !account || !canClaim) return false;

    try {
      setIsLoading(true);

      const transaction = prepareContractCall({
        contract,
        method: "claimDailyReward",
        params: [],
      });

      await sendTransaction({
        transaction,
        account: account,
      });

      await refreshData();
      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (walletType: string = 'metamask') => {
    try {
      setIsLoading(true);

      let walletToConnect: any;

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

    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      // Disconnect ThirdWeb wallet
      if (activeWallet) {
        await activeWallet.disconnect();
      }
      
      // Also try to disconnect from MetaMask directly if available
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Try to clear MetaMask connection by requesting empty accounts
          await window.ethereum.request({
            method: "eth_requestAccounts",
            params: []
          });
          
          // Also try to revoke permissions if supported
          try {
            await window.ethereum.request({
              method: "wallet_revokePermissions",
              params: [{ eth_accounts: {} }]
            });
          } catch (revokeError) {
            // This method might not be supported, which is fine
            console.log('MetaMask revoke permissions not supported');
          }
        } catch (error) {
          // MetaMask might not support these methods, which is fine
          console.log('MetaMask disconnect methods not supported');
        }
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      // Clear all local state regardless of wallet disconnect result
      setIsRegistered(false);
      setUserRecord(null);
      setDirectReferrals([]);
      setDirectReferralCount(0);
      setReferrer('');
      setDailyReward(BigInt(0));
      setRegReward(BigInt(0));
      setTimeUntilNextClaim(0);
      setTotalRegistered(0);
      setIsLoading(false);
    }
  };

  const switchToCorrectNetwork = async () => {
    try {
      if (activeWallet) {
        await activeWallet.switchChain(bscTestnet);
      } else {
        throw new Error('No active wallet available');
      }
    } catch (error) {
      throw new Error('Failed to switch to BSC Testnet. Please switch manually in your wallet.');
    }
  };

  const refreshData = async () => {
    if (!isConnected || !isCorrectNetwork) return;

    await Promise.all([
      checkRegistration(),
      fetchUserRecord(),
      fetchContractData(),
      fetchReferralData(),
    ]);
  };

  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      refreshData();
    } else {
      setIsRegistered(false);
      setUserRecord(null);
    }
  }, [isConnected, isCorrectNetwork, address]);

  const value: MiningContextType = {
    address,
    isConnected,
    isRegistered,
    isLoading,
    userRecord,
    dailyReward,
    regReward,
    directReferrals,
    directReferralCount,
    referrer,
    totalRegistered,
    canClaim,
    timeUntilNextClaim,
    connectWallet,
    disconnectWallet,
    register,
    claimDailyReward,
    refreshData,
    switchToCorrectNetwork,
    isCorrectNetwork,
  };

  return (
    <MiningContext.Provider value={value}>
      {children}
    </MiningContext.Provider>
  );
};

export const useMining = (): MiningContextType => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};
