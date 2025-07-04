import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client, bscMainnet } from '../client';
import { INVESTMENT_CONTRACT_ADDRESS, INVESTMENT_CONTRACT_ABI } from '../client';
import { USDT_CONTRACT_ADDRESS } from '../config';
import { useToast } from '../components/common/ToastNotification';

interface InvestmentPackage {
  id: number;
  name: string;
  minAmount: bigint;
  maxAmount: bigint;
  rewardMultiplier: bigint;
  totalRaised: bigint;
  totalRewardDistributed: bigint;
}

interface UserInvestmentData {
  totalContribution: bigint;
  isExists: boolean;
  contributionCount: bigint;
  totalClaimedReward: bigint;
  totalLevelIncome: bigint;
}

interface UserContribution {
  planIndex: bigint;
  amount: bigint;
  rewardClaimed: bigint;
  lastClaimTime: bigint;
  index: bigint;
}

interface InvestmentContextType {
  // User data
  userInvestmentData: UserInvestmentData | null;
  userContributions: UserContribution[];
  totalPendingRewards: bigint;

  // Package data
  packages: InvestmentPackage[];

  // Actions
  investInPackage: (packageId: number, amount: string) => Promise<boolean>;
  claimReward: (contributionIndex: number) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  approveUSDT: (amount: string) => Promise<boolean>;

  // Loading states
  isLoading: boolean;
  isInvesting: boolean;
  isClaiming: boolean;
  isApproving: boolean;
}

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};

interface InvestmentProviderProps {
  children: ReactNode;
}

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({ children }) => {
  const account = useActiveAccount();
  const address = account?.address;
  const { showSuccess, showError, showInfo } = useToast();

  // Debug logging
  console.log('Investment Contract Address:', INVESTMENT_CONTRACT_ADDRESS);
  console.log('USDT Contract Address:', USDT_CONTRACT_ADDRESS);
  console.log('Account:', address);

  useEffect(() => {
    const walletConnected = localStorage.getItem('thirdweb_wallet_connected');
    const walletType = localStorage.getItem('thirdweb_wallet_type');
    console.log('Investment Context - Wallet persistence check:', {
      walletConnected,
      walletType,
      hasAccount: !!address,
      accountAddress: address
    });
  }, [address]);
  
  const [userInvestmentData, setUserInvestmentData] = useState<UserInvestmentData | null>(null);
  const [userContributions, setUserContributions] = useState<UserContribution[]>([]);
  const [totalPendingRewards, setTotalPendingRewards] = useState<bigint>(0n);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const isConnected = !!address;
  const isCorrectNetwork = bscMainnet.id === 56;

  // Get contract instances
  const contract = getContract({
    client,
    chain: bscMainnet,
    address: INVESTMENT_CONTRACT_ADDRESS,
    abi: INVESTMENT_CONTRACT_ABI,
  });

  // USDT Contract ABI (minimal for approval)
  const USDT_ABI = [
    {
      "inputs": [
        {"internalType": "address", "name": "spender", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "address", "name": "spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  // Get USDT contract address from investment contract
  const [actualUSDTAddress, setActualUSDTAddress] = useState<string>(USDT_CONTRACT_ADDRESS);

  const usdtContract = getContract({
    client,
    chain: bscMainnet,
    address: actualUSDTAddress,
    abi: USDT_ABI,
  });

  // Package names mapping
  const packageNames = ['Starter', 'Silver', 'Gold', 'Diamond'];

  // Format BigInt to readable string
  const formatAmount = (amount: bigint, decimals: number = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const quotient = amount / divisor;
    const remainder = amount % divisor;

    if (remainder === 0n) {
      return quotient.toString();
    }

    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    if (trimmedRemainder === '') {
      return quotient.toString();
    }

    return `${quotient}.${trimmedRemainder}`;
  };

  // Get USDT address from contract
  const loadUSDTAddress = async () => {
    try {
      const usdtAddress = await readContract({
        contract,
        method: "usdt",
        params: [],
      });
      console.log('USDT address from contract:', usdtAddress);
      setActualUSDTAddress(usdtAddress as string);
    } catch (error) {
      console.error('Error getting USDT address from contract:', error);
      // Keep using the default USDT address
    }
  };

  // Load package details
  const loadPackages = async () => {
    try {
      const packagePromises = [0, 1, 2, 3].map(async (id) => {
        const poolDetails = await readContract({
          contract,
          method: "poolDetails",
          params: [BigInt(id)] as const,
        });

        const packageData = {
          id,
          name: packageNames[id],
          minAmount: poolDetails[0],
          maxAmount: poolDetails[1],
          rewardMultiplier: poolDetails[2],
          totalRaised: poolDetails[3],
          totalRewardDistributed: poolDetails[4],
        };

        console.log(`Package ${id} (${packageNames[id]}):`, {
          minAmount: formatAmount(poolDetails[0]),
          maxAmount: formatAmount(poolDetails[1]),
          rewardMultiplier: Number(poolDetails[2]),
        });

        return packageData;
      });

      const loadedPackages = await Promise.all(packagePromises);
      setPackages(loadedPackages);
      console.log('All packages loaded:', loadedPackages);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  // Load user investment data
  const loadUserData = async () => {
    if (!address || !isCorrectNetwork) return;

    try {
      setIsLoading(true);

      // Get user data
      const userData = await readContract({
        contract,
        method: "getUserData",
        params: [address],
      });

      const userInvestmentData: UserInvestmentData = {
        totalContribution: userData[0],
        isExists: userData[1],
        contributionCount: userData[2],
        totalClaimedReward: userData[3],
        totalLevelIncome: userData[4],
      };

      setUserInvestmentData(userInvestmentData);

      // Load user contributions
      const contributionPromises = [];
      for (let i = 0; i < Number(userInvestmentData.contributionCount); i++) {
        contributionPromises.push(
          readContract({
            contract,
            method: "getUserContribution",
            params: [address, BigInt(i)],
          })
        );
      }

      const contributions = await Promise.all(contributionPromises);
      const formattedContributions: UserContribution[] = contributions.map((contrib, index) => ({
        planIndex: contrib[0],
        amount: contrib[1],
        rewardClaimed: contrib[2],
        lastClaimTime: contrib[3],
        index: BigInt(index),
      }));

      console.log('User contributions loaded:', formattedContributions.map(contrib => ({
        index: Number(contrib.index),
        planIndex: Number(contrib.planIndex),
        amount: formatAmount(contrib.amount),
        rewardClaimed: formatAmount(contrib.rewardClaimed),
        lastClaimTime: new Date(Number(contrib.lastClaimTime) * 1000).toLocaleString()
      })));

      // Calculate individual rewards for debugging
      for (let i = 0; i < formattedContributions.length; i++) {
        try {
          const individualReward = await readContract({
            contract,
            method: "calculateReward",
            params: [address, BigInt(i)],
          });

          console.log(`Individual reward for contribution ${i}:`, {
            contributionIndex: i,
            reward: formatAmount(individualReward),
            rawReward: individualReward.toString(),
            investment: formatAmount(formattedContributions[i].amount),
            planIndex: Number(formattedContributions[i].planIndex)
          });
        } catch (error) {
          console.error(`Error calculating reward for contribution ${i}:`, error);
        }
      }

      setUserContributions(formattedContributions);

      // Calculate total pending rewards
      if (userInvestmentData.contributionCount > 0n) {
        const totalRewards = await readContract({
          contract,
          method: "getAllCalculatedReward",
          params: [address],
        });

        console.log('Total pending rewards calculation:', {
          contributionCount: Number(userInvestmentData.contributionCount),
          totalRewards: totalRewards.toString(),
          totalRewardsFormatted: formatAmount(totalRewards),
          userAddress: address
        });

        setTotalPendingRewards(totalRewards);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh all dashboard data
  const refreshUserData = async () => {
    if (!isConnected || !isCorrectNetwork) return;

    try {
      console.log('🔄 Refreshing all dashboard data...');

      // Refresh all data in parallel for better performance
      await Promise.all([
        loadUserData(),
        loadPackages()
      ]);

      console.log('✅ Dashboard data refreshed successfully');

      // Trigger a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('❌ Error refreshing dashboard data:', error);
    }
  };

  // Approve USDT spending
  const approveUSDT = async (amount: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      throw new Error('Please connect wallet and switch to BSC mainnet');
    }

    try {
      setIsApproving(true);

      const amountWei = BigInt(amount) * BigInt(10 ** 18); // Convert to wei

      const transaction = prepareContractCall({
        contract: usdtContract,
        method: "approve",
        params: [INVESTMENT_CONTRACT_ADDRESS, amountWei],
      });

      // Placeholder for Account object (should be set after wallet connection)
      // TODO: Store the connected Account object after wallet connection and use it here
      const [account, setAccount] = useState<any>(null);

      if (!account) {
        throw new Error('No connected account object available for transaction.');
      }
      await sendTransaction({
        transaction,
        account: account,
      });

      return true;
    } catch (error) {
      console.error('Error approving USDT:', error);
      throw error;
    } finally {
      setIsApproving(false);
    }
  };

  // Invest in package
  const investInPackage = async (packageId: number, amount: string): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      throw new Error('Please connect wallet and switch to BSC mainnet');
    }

    try {
      setIsInvesting(true);
      showInfo('Processing investment transaction...', 3000);

      const amountWei = BigInt(amount) * BigInt(10 ** 18); // Convert to wei

      // Validate amount against package limits
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (selectedPackage) {
        const minAmount = selectedPackage.minAmount;
        const maxAmount = selectedPackage.maxAmount;

        console.log('Investment validation:', {
          packageId,
          amount,
          amountWei: amountWei.toString(),
          minAmount: minAmount.toString(),
          maxAmount: maxAmount.toString(),
          minAmountFormatted: formatAmount(minAmount),
          maxAmountFormatted: formatAmount(maxAmount),
        });

        if (amountWei < minAmount) {
          throw new Error(`Minimum investment for ${selectedPackage.name} package is ${formatAmount(minAmount)} USDT`);
        }

        if (amountWei > maxAmount) {
          throw new Error(`Maximum investment for ${selectedPackage.name} package is ${formatAmount(maxAmount)} USDT`);
        }
      } else {
        throw new Error('Package not found. Please refresh and try again.');
      }

      // First, check if we need to approve USDT
      try {
        console.log('Checking USDT allowance...');
        const currentAllowance = await readContract({
          contract: usdtContract,
          method: "allowance",
          params: [address, INVESTMENT_CONTRACT_ADDRESS],
        });

        console.log('Current allowance:', currentAllowance.toString());
        console.log('Required amount:', amountWei.toString());

        if (currentAllowance < amountWei) {
          console.log('Insufficient allowance, requesting approval...');
          showInfo('Approving USDT spending...', 3000);

          // Approve USDT spending
          const approveTransaction = prepareContractCall({
            contract: usdtContract,
            method: "approve",
            params: [INVESTMENT_CONTRACT_ADDRESS, amountWei],
          });

          // Placeholder for Account object (should be set after wallet connection)
          // TODO: Store the connected Account object after wallet connection and use it here
          const [account, setAccount] = useState<any>(null);

          if (!account) {
            throw new Error('No connected account object available for transaction.');
          }
          await sendTransaction({
            transaction: approveTransaction,
            account: account,
          });

          showInfo('USDT approved! Processing investment...', 3000);

          // Wait a bit for the approval to be confirmed
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log('Allowance check failed, proceeding with approval:', error);
        showInfo('Approving USDT spending...', 3000);

        // Approve USDT spending
        const approveTransaction = prepareContractCall({
          contract: usdtContract,
          method: "approve",
          params: [INVESTMENT_CONTRACT_ADDRESS, amountWei],
        });

        // Placeholder for Account object (should be set after wallet connection)
        // TODO: Store the connected Account object after wallet connection and use it here
        const [account, setAccount] = useState<any>(null);

        if (!account) {
          throw new Error('No connected account object available for transaction.');
        }
        await sendTransaction({
          transaction: approveTransaction,
          account: account,
        });

        showInfo('USDT approved! Processing investment...', 3000);

        // Wait a bit for the approval to be confirmed
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Now proceed with the investment
      let transaction: any;
      switch (packageId) {
        case 0:
          transaction = prepareContractCall({
            contract,
            method: "StaterPackage",
            params: [amountWei],
          });
          break;
        case 1:
          transaction = prepareContractCall({
            contract,
            method: "SilverPackage",
            params: [amountWei],
          });
          break;
        case 2:
          transaction = prepareContractCall({
            contract,
            method: "GoldPackage",
            params: [amountWei],
          });
          break;
        case 3:
          transaction = prepareContractCall({
            contract,
            method: "DiamondPackage",
            params: [amountWei],
          });
          break;
        default:
          throw new Error('Invalid package ID');
      }

      // Placeholder for Account object (should be set after wallet connection)
      // TODO: Store the connected Account object after wallet connection and use it here
      const [account, setAccount] = useState<any>(null);

      if (!account) {
        throw new Error('No connected account object available for transaction.');
      }
      const result = await sendTransaction({
        transaction,
        account: account,
      });

      console.log('Investment transaction result:', result);

      // Package names for success message
      const packageNames = ['Starter', 'Silver', 'Gold', 'Diamond'];

      // Show success message
      showSuccess(
        `🎉 Investment successful! You've invested ${amount} USDT in the ${packageNames[packageId]} package. Your investment is now active and earning daily returns!`,
        8000
      );

      // Refresh data after successful investment
      console.log('🔄 Refreshing data after investment...');
      await refreshUserData();

      return true;
    } catch (error: any) {
      console.error('Error investing in package:', error);

      let errorMessage = 'Unknown error occurred';

      // Handle specific error cases
      if (error?.message?.includes('Amount must be accurate')) {
        const selectedPackage = packages.find(pkg => pkg.id === packageId);
        if (selectedPackage) {
          errorMessage = `Investment amount must be between ${formatAmount(selectedPackage.minAmount)} and ${formatAmount(selectedPackage.maxAmount)} USDT for the ${selectedPackage.name} package.`;
        } else {
          errorMessage = 'Investment amount must match the package requirements. Please check the package details.';
        }
      } else if (error?.message?.includes('0xfb8f41b2')) {
        errorMessage = 'Insufficient USDT balance or allowance. Please ensure you have enough USDT tokens.';
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please check your wallet balance.';
      } else if (error?.message?.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.reason) {
        errorMessage = error.reason;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      showError(`Investment failed: ${errorMessage}`);
      console.log('Full error object:', error);
      throw error;
    } finally {
      setIsInvesting(false);
    }
  };

  // Claim reward
  const claimReward = async (contributionIndex: number): Promise<boolean> => {
    if (!address || !isCorrectNetwork) {
      throw new Error('Please connect wallet and switch to BSC mainnet');
    }

    try {
      setIsClaiming(true);

      const transaction = prepareContractCall({
        contract,
        method: "claimReward",
        params: [BigInt(contributionIndex)],
      });

      // Placeholder for Account object (should be set after wallet connection)
      // TODO: Store the connected Account object after wallet connection and use it here
      const [account, setAccount] = useState<any>(null);

      if (!account) {
        throw new Error('No connected account object available for transaction.');
      }
      await sendTransaction({
        transaction,
        account: account,
      });

      // Show success message
      showSuccess(
        `💰 Reward claimed successfully! Your earnings have been transferred to your wallet.`,
        6000
      );

      // Refresh data after successful claim
      console.log('🔄 Refreshing data after reward claim...');
      await refreshUserData();

      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    } finally {
      setIsClaiming(false);
    }
  };

  // Load data when account or network changes
  useEffect(() => {
    const loadAllData = async () => {
      if (isConnected && isCorrectNetwork) {
        setIsLoading(true);
        try {
          // Load all data in parallel for better performance
          await Promise.all([
            loadUSDTAddress(),
            loadUserData(),
            loadPackages()
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserInvestmentData(null);
        setUserContributions([]);
        setTotalPendingRewards(0n);
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isConnected, isCorrectNetwork, address]);

  const value: InvestmentContextType = {
    userInvestmentData,
    userContributions,
    totalPendingRewards,
    packages,
    investInPackage,
    claimReward,
    refreshUserData,
    approveUSDT,
    isLoading,
    isInvesting,
    isClaiming,
    isApproving,
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
};
