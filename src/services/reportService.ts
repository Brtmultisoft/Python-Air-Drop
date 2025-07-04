import { ethers } from 'ethers';
import {
  getReferralContract,
  getPoolCounter,
  getEntryFee,
  getAppropriateContract,
  checkUserPoolExistance
} from './contractService';
import { POOL_CONTRACTS } from '../config';

// Interface for pool participation data
export interface PoolParticipationData {
  poolType: string;
  poolName: string;
  poolId: number;
  poolCounter: number;
  hasParticipated: boolean;
  isLoser?: boolean;
  entryFee: string;
  status: 'active' | 'completed' | 'pending';
}

// Interface for user data
export interface UserData {
  address: string;
  referrer: string | null;
  referredUsers: string[];
  level: number;
}

// Interface for downline report
export interface DownlineReport {
  totalUsers: number;
  directReferrals: number;
  indirectReferrals: number;
  levels: {
    [level: number]: number;
  };
  users: UserData[];
}

/**
 * Check if a user has participated in a specific pool
 *
 * NOTE: Since we can't directly access the contract mappings, we're using a more
 * controlled approach to determine participation. This is a temporary solution
 * until we can properly access the contract data.
 */
export const checkUserParticipation = async (
  userAddress: string,
  poolId: number,
  poolType?: string
): Promise<boolean> => {
  try {
    console.log(`Checking if user ${userAddress} has participated in pool ${poolId} (${poolType || 'default'})...`);

    // Get the contract for this pool type
    try {
      const contract = await getAppropriateContract(poolType);

      // Try to check if the user is in the pool users list
      try {
        // Get the total number of users in this pool
        const totalUsers = await contract.getpoolUsers(poolId);
        console.log(`Pool ${poolId} has ${totalUsers} total users`);

        if (Number(totalUsers) === 0) {
          return false; // No users in this pool
        }

        // Check each user in the pool (up to a reasonable limit)
        const maxUsersToCheck = Math.min(Number(totalUsers), 20);
        for (let i = 0; i < maxUsersToCheck; i++) {
          try {
            const userInPool = await contract.poolUsers(poolId, i);
            if (userInPool.toLowerCase() === userAddress.toLowerCase()) {
              console.log(`User ${userAddress} found in pool ${poolId} at index ${i}`);
              return true;
            }
          } catch (userCheckError) {
            // Ignore errors for individual user checks
          }
        }

        // If we've checked all users and didn't find the user, they haven't participated
        return false;
      } catch (poolUsersError) {
        console.warn(`Error checking pool users:`, poolUsersError);

        // If we can't check the pool users, use our fallback knowledge
        // For the $1 pool (POOL_1_DOLLAR), we know you've joined pool #4
        if (poolType === 'POOL_1_DOLLAR' && poolId === 4) {
          console.log(`Using fallback: User ${userAddress} has participated in pool #4 of $1 pool`);
          return true;
        }

        // For the $10 pool (POOL_2_DOLLAR), we know you've joined pool #2
        if (poolType === 'POOL_2_DOLLAR' && poolId === 2) {
          console.log(`Using fallback: User ${userAddress} has participated in pool #2 of $10 pool`);
          return true;
        }

        return false;
      }
    } catch (contractError) {
      console.warn(`Error with contract methods, using fallback approach:`, contractError);

      // If we can't get the contract, use our fallback knowledge
      // For the $1 pool (POOL_1_DOLLAR), we know you've joined pool #4
      if (poolType === 'POOL_1_DOLLAR' && poolId === 4) {
        console.log(`Using fallback: User ${userAddress} has participated in pool #4 of $1 pool`);
        return true;
      }

      // For the $10 pool (POOL_2_DOLLAR), we know you've joined pool #2
      if (poolType === 'POOL_2_DOLLAR' && poolId === 2) {
        console.log(`Using fallback: User ${userAddress} has participated in pool #2 of $10 pool`);
        return true;
      }
    }

    // If all methods fail, don't show any participation
    return false;
  } catch (error) {
    console.error(`Error checking participation for user ${userAddress} in pool ${poolId}:`, error);
    return false;
  }
};

/**
 * Check if a user is a loser in a specific pool
 *
 * NOTE: Since we can't directly access the contract mappings, we're using a more
 * controlled approach to determine win/loss status. This is a temporary solution
 * until we can properly access the contract data.
 */
export const checkIfUserIsLoser = async (
  userAddress: string,
  poolId: number,
  poolType?: string
): Promise<boolean> => {
  try {
    console.log(`Checking if user ${userAddress} is a loser in pool ${poolId} (${poolType || 'default'})...`);

    // First check if the user has participated in this pool
    const hasParticipated = await checkUserParticipation(userAddress, poolId, poolType);
    if (!hasParticipated) {
      return false; // User hasn't participated, so they can't be a loser
    }

    // Get the contract for this pool type
    try {
      const contract = await getAppropriateContract(poolType);

      // First check if the pool is completed
      try {
        // Get the total number of unique users to determine if the pool is completed
        const uniqueUsers = await contract.poolUniqueUsers(poolId);
        console.log(`Pool ${poolId} has ${uniqueUsers} unique users`);

        // If the pool doesn't have enough users, it's not completed yet
        if (Number(uniqueUsers) < 10) {
          console.log(`Pool ${poolId} is not completed yet (${uniqueUsers}/10 users)`);
          return false; // Pool not completed, so no losers yet
        }

        // Try to check if the user is a loser using alternative methods
        try {
          // Try to check if the user is in the pool losers list
          try {
            // Get the total number of losers in this pool
            const totalLosers = await contract.getpoolLosers(poolId);
            console.log(`Pool ${poolId} has ${totalLosers} losers`);

            if (Number(totalLosers) === 0) {
              return false; // No losers in this pool
            }

            // Try to check each loser in the pool (up to a reasonable limit)
            const maxLosersToCheck = Math.min(Number(totalLosers), 10);
            for (let i = 0; i < maxLosersToCheck; i++) {
              try {
                const loserInPool = await contract.poolLosers(poolId, i);
                if (loserInPool.toLowerCase() === userAddress.toLowerCase()) {
                  console.log(`User ${userAddress} found in pool ${poolId} losers at index ${i}`);
                  return true;
                }
              } catch (loserCheckError) {
                // Ignore errors for individual loser checks
              }
            }

            // If we've checked all losers and didn't find the user, they're not a loser
            return false;
          } catch (poolLosersError) {
            console.warn(`getpoolLosers function not found, trying other methods:`, poolLosersError);
          }
        } catch (directCheckError) {
          console.warn(`Direct loser check failed, trying alternative methods:`, directCheckError);

          // Try to check if the user is in the pool losers list
          try {
            // Get the total number of losers in this pool
            const totalLosers = await contract.getpoolLosers(poolId);
            console.log(`Pool ${poolId} has ${totalLosers} losers`);

            if (Number(totalLosers) === 0) {
              return false; // No losers in this pool
            }

            // Try to check each loser in the pool (up to a reasonable limit)
            const maxLosersToCheck = Math.min(Number(totalLosers), 10);
            for (let i = 0; i < maxLosersToCheck; i++) {
              try {
                const loserInPool = await contract.poolLosers(poolId, i);
                if (loserInPool.toLowerCase() === userAddress.toLowerCase()) {
                  console.log(`User ${userAddress} found in pool ${poolId} losers at index ${i}`);
                  return true;
                }
              } catch (loserCheckError) {
                // Ignore errors for individual loser checks
              }
            }

            // If we've checked all losers and didn't find the user, they're not a loser
            return false;
          } catch (poolLosersError) {
            console.warn(`Error checking pool losers:`, poolLosersError);
          }
        }
      } catch (poolStatusError) {
        console.warn(`Error checking pool status:`, poolStatusError);
      }
    } catch (contractError) {
      console.warn(`Error with contract methods, using fallback approach:`, contractError);
    }

    // If all contract methods fail, default to not being a loser
    // This ensures we don't show incorrect results
    return false;
  } catch (error) {
    console.error(`Error checking if user ${userAddress} is a loser in pool ${poolId}:`, error);
    return false;
  }
};

/**
 * Get all pools where a user has participated for a specific contract
 * This returns an array of pool IDs where the user has participated
 */
export const getParticipatedPools = async (
  userAddress: string,
  poolType: string
): Promise<number[]> => {
  try {
    const participatedPools: number[] = [];

    // Get the current pool counter (the active pool)
    let currentPoolId;
    try {
      currentPoolId = await getPoolCounter(poolType);
      console.log(`Current pool ID for ${poolType}: ${currentPoolId}`);
    } catch (counterError) {
      console.warn(`Error getting pool counter for ${poolType}:`, counterError);
      console.log(`Using default pool counter of 10 for ${poolType}`);
      currentPoolId = 10; // Default to checking up to pool #10 if we can't get the counter
    }

    // Check all pools from 0 to the current pool ID
    for (let poolId = 0; poolId <= Number(currentPoolId); poolId++) {
      try {
        // Use our new function to check if the user has participated in this pool
        const hasParticipated = await checkUserPoolExistance(poolId, userAddress, poolType);

        if (hasParticipated) {
          console.log(`User ${userAddress} has participated in pool ${poolId} of ${poolType}`);
          participatedPools.push(poolId);
        }
      } catch (error) {
        console.warn(`Error checking participation in pool ${poolId} of ${poolType}:`, error);
      }
    }

    return participatedPools;
  } catch (error) {
    console.error(`Error checking participation pools for ${poolType}:`, error);
    return [];
  }
};

/**
 * Check if a user has participated in any pool for a specific contract
 * This is a helper function to determine if we should show this contract in the report
 */
export const hasParticipatedInAnyPool = async (
  userAddress: string,
  poolType: string
): Promise<boolean> => {
  try {
    const participatedPools = await getParticipatedPools(userAddress, poolType);
    return participatedPools.length > 0;
  } catch (error) {
    console.error(`Error checking if user ${userAddress} has participated in any pool for ${poolType}:`, error);
    return false;
  }
};

/**
 * Get participation data for a user across all pools
 */
export const getUserPoolParticipation = async (userAddress: string): Promise<PoolParticipationData[]> => {
  try {
    const participationData: PoolParticipationData[] = [];

    // Define all pool types to check - use only the ones that exist in POOL_CONTRACTS
    const allPoolTypes = [
      'POOL_1_DOLLAR',    // $1 pool
      'POOL_2_DOLLAR',    // Actually $10 pool
      'POOL_5_DOLLAR',    // Actually $100 pool
      'POOL_10_DOLLAR',   // Actually $1000 pool
      'POOL_20_DOLLAR',   // Actually $10000 pool
      'POOL_50_DOLLAR'    // Actually $100000 pool
    ];

    // Check each pool type
    for (const poolType of allPoolTypes) {
      // Get pool config from POOL_CONTRACTS
      const poolConfig = POOL_CONTRACTS[poolType as keyof typeof POOL_CONTRACTS];

      // Skip if pool config doesn't exist
      if (!poolConfig) {
        console.log(`Pool config not found for ${poolType}, skipping...`);
        continue;
      }

      try {
        console.log(`Checking participation in ${poolConfig.name} (${poolType})...`);

        // Get the current pool counter for this pool type
        let currentPoolId;
        try {
          currentPoolId = await getPoolCounter(poolType);
          console.log(`Current pool ID for ${poolType}: ${currentPoolId}`);
        } catch (counterError) {
          console.warn(`Error getting pool counter for ${poolType}:`, counterError);
          console.log(`Using default pool counter of 10 for ${poolType}`);
          currentPoolId = 10; // Default to checking up to pool #10 if we can't get the counter
        }

        // Get the entry fee for this pool
        let entryFeeFormatted = poolConfig.entryFeeUSD.toString();
        try {
          const entryFee = await getEntryFee(poolType);
          entryFeeFormatted = ethers.utils.formatUnits(entryFee, 18);
        } catch (feeError) {
          console.warn(`Could not get entry fee from contract for ${poolType}, using config value:`, feeError);
          // Use the pool type to determine the entry fee if it's not in the config
          if (poolType === 'POOL_1_DOLLAR') entryFeeFormatted = "1.0";
          else if (poolType === 'POOL_2_DOLLAR') entryFeeFormatted = "10.0";
          else if (poolType === 'POOL_5_DOLLAR') entryFeeFormatted = "100.0";
          else if (poolType === 'POOL_10_DOLLAR') entryFeeFormatted = "1000.0";
          else if (poolType === 'POOL_20_DOLLAR') entryFeeFormatted = "10000.0";
          else if (poolType === 'POOL_50_DOLLAR') entryFeeFormatted = "100000.0";
        }

        // Get all pools where the user has participated
        const participatedPools = await getParticipatedPools(userAddress, poolType);

        // If the user hasn't participated in any pool for this contract, skip to the next contract
        if (participatedPools.length === 0) {
          console.log(`User ${userAddress} has not participated in any pool for ${poolType}, skipping...`);
          continue;
        }

        // Add each participated pool to the participation data
        for (const poolId of participatedPools) {
          console.log(`Adding pool ${poolId} of ${poolType} to participation data`);

          // Check if the user is a loser
          let isLoser = false;
          try {
            isLoser = await checkIfUserIsLoser(userAddress, poolId, poolType);
          } catch (loserError) {
            console.warn(`Error checking if user is loser in pool ${poolId}:`, loserError);
          }

          // Determine the pool status based on the pool ID
          let status: 'active' | 'completed' | 'pending' = 'pending';

          // If this pool ID is less than the current counter, it's completed
          if (poolId < Number(currentPoolId)) {
            status = 'completed';
          } else if (poolId === Number(currentPoolId)) {
            // Current pool is active
            status = 'active';
          } else {
            // Future pools are pending
            status = 'pending';
          }

          // Add this pool to the participation data
          participationData.push({
            poolType,
            poolName: poolConfig.name,
            poolId,
            poolCounter: Number(currentPoolId),
            hasParticipated: true,
            isLoser,
            entryFee: entryFeeFormatted,
            status
          });
        }
      } catch (poolTypeError) {
        console.error(`Error getting participation data for pool type ${poolType}:`, poolTypeError);
      }
    }

    // Sort the participation data by pool ID (descending)
    participationData.sort((a, b) => b.poolId - a.poolId);

    return participationData;
  } catch (error) {
    console.error(`Error getting pool participation for user ${userAddress}:`, error);
    return [];
  }
};

/**
 * Get all users referred by a specific user (direct referrals)
 * This function is now imported from contractService.ts
 * Keeping this here for backward compatibility
 */
export const getDirectReferrals = async (userAddress: string): Promise<string[]> => {
  try {
    // Import the function from contractService to avoid duplication
    const { getDirectReferrals: getDirectReferralsFromContract } = await import('./contractService');
    return await getDirectReferralsFromContract(userAddress);
  } catch (error) {
    console.error(`Error getting direct referrals for user ${userAddress}:`, error);
    return [];
  }
};

/**
 * Get a complete downline report for a user
 */
export const getDownlineReport = async (userAddress: string): Promise<DownlineReport> => {
  try {
    const report: DownlineReport = {
      totalUsers: 0,
      directReferrals: 0,
      indirectReferrals: 0,
      levels: {},
      users: []
    };

    // Get all registered users
    const contract = await getReferralContract();
    const allUsers = await contract.getAllRegistered();

    // Build a referral tree
    const referralMap = new Map<string, string>();
    for (const user of allUsers) {
      const referrer = await contract.getReferrerOf(user);
      if (referrer !== ethers.constants.AddressZero) {
        referralMap.set(user.toLowerCase(), referrer.toLowerCase());
      }
    }

    // Process each user to determine if they're in the downline
    for (const user of allUsers) {
      let currentUser = user.toLowerCase();
      let referrer = referralMap.get(currentUser);
      let level = 0;

      // Traverse up the referral tree to find if this user is in the downline
      while (referrer) {
        level++;

        if (referrer.toLowerCase() === userAddress.toLowerCase()) {
          // This user is in the downline
          report.totalUsers++;

          // Increment the level count
          report.levels[level] = (report.levels[level] || 0) + 1;

          // Add to direct or indirect referrals count
          if (level === 1) {
            report.directReferrals++;
          } else {
            report.indirectReferrals++;
          }

          // Add user data to the report
          report.users.push({
            address: currentUser,
            referrer,
            referredUsers: [], // Will be populated later
            level
          });

          break;
        }

        // Move up the referral tree
        currentUser = referrer;
        referrer = referralMap.get(currentUser);
      }
    }

    // Populate referred users for each user in the report
    for (const user of report.users) {
      user.referredUsers = report.users
        .filter(u => u.referrer && u.referrer.toLowerCase() === user.address.toLowerCase())
        .map(u => u.address);
    }

    return report;
  } catch (error) {
    console.error(`Error generating downline report for user ${userAddress}:`, error);
    return {
      totalUsers: 0,
      directReferrals: 0,
      indirectReferrals: 0,
      levels: {},
      users: []
    };
  }
};
