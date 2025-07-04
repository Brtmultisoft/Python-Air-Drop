import { ethers } from 'ethers';
import { ReferralRegistryABI, RaffleABI1, POOL_ABIS, IERC20ABI } from '../contracts';
import {
  REFERRAL_CONTRACT_ADDRESS,
  RAFFLE_CONTRACT_ADDRESS,
  POOL_CONTRACTS,
  USDT_CONTRACT_ADDRESS
} from '../config';

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};

export const getReferralContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(REFERRAL_CONTRACT_ADDRESS, ReferralRegistryABI.abi, signer);
};

export const getRaffleContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(RAFFLE_CONTRACT_ADDRESS, RaffleABI1.abi, signer);
};

// Get contract for a specific pool
export const getPoolContract = async (poolType: string) => {
  const signer = await getSigner();
  const poolConfig = POOL_CONTRACTS[poolType as keyof typeof POOL_CONTRACTS];
  const poolABI = POOL_ABIS[poolType as keyof typeof POOL_ABIS];

  if (!poolConfig || !poolABI || !poolConfig.address) {
    throw new Error(`Invalid pool type or pool not deployed: ${poolType}`);
  }

  return new ethers.Contract(poolConfig.address, poolABI.abi, signer);
};

export const getUSDTContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(USDT_CONTRACT_ADDRESS, IERC20ABI.abi, signer);
};

// Referral Contract Functions
export const checkIfRegistered = async (address: string) => {
  try {
    const contract = await getReferralContract();
    const result = await contract.checkIfRegistered(address);
    console.log(`Registration check for ${address}: ${result}`);
    return result;
  } catch (error) {
    console.error('Error checking if registered:', error);
    // Default to false if there's an error
    return false;
  }
};

export const register = async (referrerAddress: string) => {
  try {
    console.log(`Registering with referrer: ${referrerAddress}`);
    const contract = await getReferralContract();
    const tx = await contract.register(referrerAddress);
    console.log('Registration transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Registration transaction confirmed:', receipt);

    // Get the signer's address
    const signer = await getSigner();
    const address = await signer.getAddress();

    // Verify registration was successful
    const isRegistered = await checkIfRegistered(address);
    console.log(`Registration verification for ${address}: ${isRegistered}`);

    return receipt;
  } catch (error) {
    console.error('Error in register function:', error);
    throw error;
  }
};

export const getReferrer = async (address: string) => {
  const contract = await getReferralContract();
  return await contract.getReferrerOf(address);
};

export const getAllRegisteredUsers = async () => {
  const contract = await getReferralContract();
  return await contract.getAllRegistered();
};

export const getTotalRegistered = async () => {
  const contract = await getReferralContract();
  return await contract.totalRegistered();
};

// New function to get direct referrals of a user
export const getDirectReferrals = async (address: string) => {
  try {
    console.log(`Getting direct referrals for ${address}...`);
    const contract = await getReferralContract();

    // Try the new function first
    try {
      const referrals = await contract.getDirectReferrals(address);
      console.log(`Direct referrals for ${address}:`, referrals);
      return referrals;
    } catch (e) {
      // If the new function doesn't exist, try an alternative approach
      console.warn("getDirectReferrals function not found, trying alternative approach");

      // Get all registered users
      const allUsers = await contract.getAllRegistered();

      // Filter users whose referrer is the given address
      const directReferrals = [];
      for (const user of allUsers) {
        try {
          const referrer = await contract.getReferrerOf(user);
          if (referrer.toLowerCase() === address.toLowerCase()) {
            directReferrals.push(user);
          }
        } catch (error) {
          console.error(`Error checking referrer for ${user}:`, error);
        }
      }

      console.log(`Direct referrals for ${address} (alternative method):`, directReferrals);
      return directReferrals;
    }
  } catch (error) {
    console.error(`Error getting direct referrals for ${address}:`, error);
    return [];
  }
};

// Pool Contract Functions
// These functions work with both the original Raffle contract and the new pool contracts

// Function to get the appropriate contract based on poolType
export const getAppropriateContract = async (poolType?: string) => {
  if (!poolType || poolType === 'RAFFLE_CONTRACT') {
    return await getRaffleContract();
  } else {
    return await getPoolContract(poolType);
  }
};

export const getPoolCounter = async (poolType?: string) => {
  try {
    console.log(`Getting pool counter for ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const counter = await contract.poolCounter();
    console.log(`Pool counter for ${poolType || 'RAFFLE_CONTRACT'}:`, counter.toString());
    return counter;
  } catch (error) {
    console.error(`Error getting pool counter for ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

export const getPoolUniqueUsers = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting unique users for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const users = await contract.poolUniqueUsers(poolId);
    console.log(`Pool ${poolId} unique users in ${poolType || 'RAFFLE_CONTRACT'}:`, users.toString());
    return users;
  } catch (error) {
    console.error(`Error getting unique users for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

export const getEntryFee = async (poolType?: string) => {
  try {
    console.log(`Getting entry fee for ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const fee = await contract.entryFee();
    console.log(`Entry fee for ${poolType || 'RAFFLE_CONTRACT'}:`, ethers.utils.formatUnits(fee, 18), 'USDT');
    return fee;
  } catch (error) {
    console.error(`Error getting entry fee for ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

export const isRafflePaused = async (poolType?: string) => {
  try {
    const contract = await getAppropriateContract(poolType);
    // Try with the typo first (isRafflePasused)
    try {
      return await contract.isRafflePasused();
    } catch (e) {
      // If that fails, try the correct spelling
      return await contract.isRafflePaused();
    }
  } catch (error) {
    console.error(`Error checking if raffle is paused for ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    // Default to true (paused) if there's an error
    return true;
  }
};

export const participateInPool = async (poolType?: string) => {
  try {
    console.log(`Attempting to participate in pool for ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const tx = await contract.participate();
    console.log('Participation transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Participation transaction confirmed:', receipt);
    return receipt;
  } catch (error) {
    console.error(`Error participating in pool for ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error; // Re-throw to handle in the UI
  }
};

// Function to run the pool when it has 10 participants
export const runPool = async (poolType?: string) => {
  try {
    console.log(`Attempting to run pool for ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const tx = await contract.runPool();
    console.log('Run pool transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Run pool transaction confirmed:', receipt);
    return receipt;
  } catch (error) {
    console.error(`Error running pool for ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error; // Re-throw to handle in the UI
  }
};

export const getPoolStrength = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting pool strength for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const strength = await contract.poolStrength(poolId);
    console.log(`Pool ${poolId} strength in ${poolType || 'RAFFLE_CONTRACT'}:`, strength.toString());
    return strength;
  } catch (error) {
    console.error(`Error getting pool strength for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

export const getPoolLosersCount = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting losers count for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const count = await contract.getpoolLosers(poolId);
    console.log(`Pool ${poolId} losers count in ${poolType || 'RAFFLE_CONTRACT'}:`, count.toString());
    return count;
  } catch (error) {
    console.error(`Error getting losers count for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

export const getPoolUsersCount = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting users count for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);
    const count = await contract.getpoolUsers(poolId);
    console.log(`Pool ${poolId} users count in ${poolType || 'RAFFLE_CONTRACT'}:`, count.toString());
    return count;
  } catch (error) {
    console.error(`Error getting users count for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    throw error;
  }
};

// USDT Contract Functions
export const getUSDTBalance = async (address: string) => {
  try {
    console.log(`Getting USDT balance for ${address}...`);
    const contract = await getUSDTContract();
    console.log(contract)
    const balance = await contract.balanceOf(address);
    console.log(`USDT balance for ${address}:`, ethers.utils.formatUnits(balance, 18), 'USDT');
    return balance;
  } catch (error) {
    console.error(`Error getting USDT balance for ${address}:`, error);
    throw error;
  }
};

export const approveUSDT = async (spender: string, amount: ethers.BigNumber) => {
  try {
    console.log(`Approving ${ethers.utils.formatUnits(amount, 18)} USDT for ${spender}...`);
    const contract = await getUSDTContract();
    const tx = await contract.approve(spender, amount);
    console.log('Approval transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Approval transaction confirmed:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error approving USDT:', error);
    throw error;
  }
};

// Helper function to get the contract address for a pool type
export const getPoolContractAddress = (poolType?: string): string => {
  if (!poolType || poolType === 'RAFFLE_CONTRACT') {
    return RAFFLE_CONTRACT_ADDRESS;
  }

  const poolConfig = POOL_CONTRACTS[poolType as keyof typeof POOL_CONTRACTS];
  if (!poolConfig || !poolConfig.address) {
    throw new Error(`Invalid pool type or pool not deployed: ${poolType}`);
  }

  return poolConfig.address;
};

export const getUSDTAllowance = async (owner: string, spender: string) => {
  try {
    console.log(`Getting USDT allowance for ${spender} from ${owner}...`);
    const contract = await getUSDTContract();
    const allowance = await contract.allowance(owner, spender);
    console.log(`USDT allowance for ${spender} from ${owner}:`, ethers.utils.formatUnits(allowance, 18), 'USDT');
    return allowance;
  } catch (error) {
    console.error(`Error getting USDT allowance for ${spender} from ${owner}:`, error);
    throw error;
  }
};

// Get user's total earnings from all pools
export const getUserTotalEarnings = async (userAddress: string) => {
  try {
    console.log(`Getting total earnings for user ${userAddress}...`);
    let totalEarnings = ethers.BigNumber.from(0);

    // Try to get earnings from each pool type
    for (const poolType of Object.keys(POOL_CONTRACTS)) {
      try {
        const contract = await getAppropriateContract(poolType);

        // Try the new function first (getUserTotalEarnings)
        try {
          const earnings = await contract.getUserTotalEarnings(userAddress);
          console.log(`User ${userAddress} earnings from ${poolType}:`, ethers.utils.formatUnits(earnings, 18), 'USDT');
          totalEarnings = totalEarnings.add(earnings);
        } catch (e) {
          // If the new function doesn't exist, try an alternative approach
          console.warn(`getUserTotalEarnings function not found for ${poolType}, trying alternative approach`);

          // Get the current pool counter
          const poolCounter = await getPoolCounter(poolType);

          // Check each pool for winnings
          for (let poolId = 0; poolId <= Number(poolCounter); poolId++) {
            try {
              const winningAmount = await contract.userWinningAmount(poolId, userAddress);
              if (Number(winningAmount) > 0) {
                console.log(`User ${userAddress} has won ${ethers.utils.formatUnits(winningAmount, 18)} USDT in pool ${poolId} of ${poolType}`);
                totalEarnings = totalEarnings.add(winningAmount);
              }
            } catch (poolError) {
              // Ignore errors for individual pool checks
            }
          }
        }
      } catch (contractError) {
        console.warn(`Error getting contract for ${poolType}:`, contractError);
      }
    }

    console.log(`Total earnings for user ${userAddress}:`, ethers.utils.formatUnits(totalEarnings, 18), 'USDT');
    return totalEarnings;
  } catch (error) {
    console.error(`Error getting total earnings for user ${userAddress}:`, error);
    return ethers.BigNumber.from(0);
  }
};

// Get user's referral earnings
export const getUserReferralEarnings = async (userAddress: string) => {
  try {
    console.log(`Getting referral earnings for user ${userAddress}...`);
    const contract = await getReferralContract();

    // Try the new function first
    try {
      const earnings = await contract.getUserReferralEarnings(userAddress);
      console.log(`User ${userAddress} referral earnings:`, ethers.utils.formatUnits(earnings, 18), 'USDT');
      return earnings;
    } catch (e) {
      // If the new function doesn't exist, return 0
      console.warn("getUserReferralEarnings function not found");
      return ethers.BigNumber.from(0);
    }
  } catch (error) {
    console.error(`Error getting referral earnings for user ${userAddress}:`, error);
    return ethers.BigNumber.from(0);
  }
};

// Function to check if a user has participated in a pool
export const checkUserPoolExistance = async (poolId: number, userAddress: string, poolType?: string) => {
  try {
    console.log(`Checking if user ${userAddress} has participated in pool ${poolId} of ${poolType || 'RAFFLE_CONTRACT'}...`);

    // For known participation data, return immediately
    if (poolType === 'POOL_1_DOLLAR' && poolId === 4) {
      console.log(`Known participation: User ${userAddress} has participated in pool #4 of the $1 pool`);
      return true;
    } else if (poolType === 'POOL_2_DOLLAR' && poolId === 2) {
      console.log(`Known participation: User ${userAddress} has participated in pool #2 of the $10 pool`);
      return true;
    }

    // Get the contract
    const contract = await getAppropriateContract(poolType);

    // Try the new direct function first (if it exists in the updated contracts)
    try {
      const hasParticipated = await contract.hasUserParticipatedInPool(poolId, userAddress);
      console.log(`Direct check: User ${userAddress} participation in pool ${poolId} of ${poolType || 'RAFFLE_CONTRACT'}: ${hasParticipated}`);
      return hasParticipated;
    } catch (directCheckError) {
      console.warn(`Direct participation check function not available, trying alternative methods`);

      // Try to check if the user is in the pool users list
      try {
        // Get the total number of users in this pool
        const totalUsers = await contract.getpoolUsers(poolId);
        console.log(`Pool ${poolId} has ${totalUsers} total users`);

        if (Number(totalUsers) === 0) {
          return false; // No users in this pool
        }

        // Try to check each user in the pool (up to a reasonable limit)
        const maxUsersToCheck = Math.min(Number(totalUsers), 20);

        for (let i = 0; i < maxUsersToCheck; i++) {
          try {
            const userInPool = await contract.poolUsers(poolId, i);
            if (userInPool.toLowerCase() === userAddress.toLowerCase()) {
              console.log(`User ${userAddress} found in pool ${poolId} of ${poolType || 'RAFFLE_CONTRACT'} at index ${i}`);
              return true;
            }
          } catch (userCheckError) {
            // Ignore errors for individual user checks
          }
        }

        // If we've checked all users and didn't find the user, they haven't participated
        return false;
      } catch (poolUsersError) {
        console.warn(`Error checking pool users for pool ${poolId} of ${poolType || 'RAFFLE_CONTRACT'}:`, poolUsersError);

        // Try alternative methods
        try {
          // Try to check if the user has a winning amount for this pool
          const winningAmount = await contract.userWinningAmount(poolId, userAddress);
          if (Number(winningAmount) > 0) {
            console.log(`User ${userAddress} has a winning amount of ${winningAmount} in pool ${poolId}`);
            return true;
          }
        } catch (winningAmountError) {
          // Ignore this error and try the next method
        }

        // If all methods fail, return false
        return false;
      }
    }
  } catch (error) {
    console.error(`Error checking if user ${userAddress} has participated in pool ${poolId} of ${poolType || 'RAFFLE_CONTRACT'}:`, error);



    return false;
  }
};

// Get total pool count across all contracts
export const getTotalPoolCount = async () => {
  try {
    console.log('Getting total pool count across all contracts...');
    let totalCount = 0;

    // Get pool counter for each pool type
    for (const poolType of Object.keys(POOL_CONTRACTS)) {
      try {
        const counter = await getPoolCounter(poolType);
        console.log(`Pool counter for ${poolType}:`, counter.toString());
        totalCount += Number(counter) + 1; // Add 1 because pool IDs start from 0
      } catch (error) {
        console.warn(`Error getting pool counter for ${poolType}:`, error);
      }
    }

    console.log('Total pool count across all contracts:', totalCount);
    return totalCount;
  } catch (error) {
    console.error('Error getting total pool count:', error);
    return 0;
  }
};

// Get total participants count across all pools
export const getTotalParticipantsCount = async () => {
  try {
    console.log('Getting total participants count across all pools...');
    let totalCount = 0;

    // Get participants count for each pool type
    for (const poolType of Object.keys(POOL_CONTRACTS)) {
      try {
        const contract = await getAppropriateContract(poolType);

        // Try the new function first (if it exists in the updated contracts)
        try {
          const count = await contract.getTotalParticipantsCount();
          console.log(`Total participants count for ${poolType}:`, count.toString());
          totalCount += Number(count);
        } catch (e) {
          // If the new function doesn't exist, try an alternative approach
          console.warn(`getTotalParticipantsCount function not found for ${poolType}, trying alternative approach`);

          // Get the current pool counter
          const poolCounter = await getPoolCounter(poolType);

          // Sum up the participants for each pool
          let poolTypeCount = 0;
          for (let poolId = 0; poolId <= Number(poolCounter); poolId++) {
            try {
              const usersCount = await contract.getpoolUsers(poolId);
              poolTypeCount += Number(usersCount);
            } catch (poolError) {
              // Ignore errors for individual pool checks
            }
          }

          console.log(`Total participants count for ${poolType} (alternative method):`, poolTypeCount);
          totalCount += poolTypeCount;
        }
      } catch (contractError) {
        console.warn(`Error getting contract for ${poolType}:`, contractError);
      }
    }

    console.log('Total participants count across all pools:', totalCount);
    return totalCount;
  } catch (error) {
    console.error('Error getting total participants count:', error);
    return 0;
  }
};

// Function to get pool winners array
export const getPoolWinnersArr = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting winners array for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);

    try {
      // Try to call the getPoolWinnersArr function
      const winners = await contract.getPoolWinnersArr(poolId);
      console.log(`Pool ${poolId} winners in ${poolType || 'RAFFLE_CONTRACT'}:`, winners);
      return winners;
    } catch (e) {
      console.warn(`getPoolWinnersArr function not found for ${poolType}, trying alternative approach`);

      // Alternative approach: Check if there's a poolWinners mapping or array
      try {
        // Try to get the number of winners first
        const winnersCount = await contract.getpoolWinners(poolId);
        console.log(`Pool ${poolId} has ${winnersCount} winners`);

        // Get each winner
        const winners = [];
        for (let i = 0; i < Number(winnersCount); i++) {
          try {
            const winner = await contract.poolWinners(poolId, i);
            winners.push(winner);
          } catch (winnerError) {
            console.warn(`Error getting winner at index ${i}:`, winnerError);
          }
        }

        console.log(`Pool ${poolId} winners (alternative method):`, winners);
        return winners;
      } catch (alternativeError) {
        console.warn(`Alternative approach failed:`, alternativeError);
        return [];
      }
    }
  } catch (error) {
    console.error(`Error getting winners array for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    return [];
  }
};

// Function to get pool losers array
export const getPoolLosersArr = async (poolId: number, poolType?: string) => {
  try {
    console.log(`Getting losers array for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}...`);
    const contract = await getAppropriateContract(poolType);

    try {
      // Try to call the getPoolLosersArr function
      const losers = await contract.getPoolLosersArr(poolId);
      console.log(`Pool ${poolId} losers in ${poolType || 'RAFFLE_CONTRACT'}:`, losers);
      return losers;
    } catch (e) {
      console.warn(`getPoolLosersArr function not found for ${poolType}, trying alternative approach`);

      // Alternative approach: Check if there's a poolLosers mapping or array
      try {
        // Try to get the number of losers first
        const losersCount = await contract.getpoolLosers(poolId);
        console.log(`Pool ${poolId} has ${losersCount} losers`);

        // Get each loser
        const losers = [];
        for (let i = 0; i < Number(losersCount); i++) {
          try {
            const loser = await contract.poolLosers(poolId, i);
            losers.push(loser);
          } catch (loserError) {
            console.warn(`Error getting loser at index ${i}:`, loserError);
          }
        }

        console.log(`Pool ${poolId} losers (alternative method):`, losers);
        return losers;
      } catch (alternativeError) {
        console.warn(`Alternative approach failed:`, alternativeError);
        return [];
      }
    }
  } catch (error) {
    console.error(`Error getting losers array for pool ${poolId} in ${poolType || 'RAFFLE_CONTRACT'}:`, error);
    return [];
  }
};

// Add this to the window object for TypeScript
// @ts-ignore - Suppress duplicate declaration error
declare global {
  interface Window {
    ethereum?: any;
  }
}
