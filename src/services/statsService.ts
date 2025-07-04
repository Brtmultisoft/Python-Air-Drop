import { ethers } from 'ethers';
import {
  getDirectReferrals,
  getUserTotalEarnings,
  getUserReferralEarnings,
  getTotalPoolCount,
  getTotalParticipantsCount,
  getPoolCounter,
  getAppropriateContract
} from './contractService';
import { POOL_CONTRACTS } from '../config';

// Interface for earnings data
export interface EarningsData {
  totalLevelEarnings: string;
  totalPoolEarnings: string;
  totalEarnings: string;
}

// Get user's dashboard statistics
export const getUserDashboardStats = async (userAddress: string) => {
  try {
    console.log(`Getting dashboard stats for user ${userAddress}...`);

    // Get all stats in parallel for better performance
    const [
      directReferrals,
      totalEarnings,
      referralEarnings,
    ] = await Promise.all([
      getDirectReferrals(userAddress),
      getUserTotalEarnings(userAddress),
      getUserReferralEarnings(userAddress),
    ]);

    return {
      directReferralsCount: directReferrals.length,
      totalEarnings: ethers.utils.formatUnits(totalEarnings, 18),
      referralEarnings: ethers.utils.formatUnits(referralEarnings, 18),
    };
  } catch (error) {
    console.error(`Error getting dashboard stats for user ${userAddress}:`, error);
    return {
      directReferralsCount: 0,
      totalEarnings: '0',
      referralEarnings: '0',
      participatedPoolsCount: 0
    };
  }
};

// Get global platform statistics
export const getGlobalStats = async () => {
  try {
    console.log('Getting global platform statistics...');

    // Get all stats in parallel for better performance
    const [
      totalPoolCount,
      totalParticipantsCount
    ] = await Promise.all([
      getTotalPoolCount(),
      getTotalParticipantsCount()
    ]);

    return {
      totalPoolCount,
      totalParticipantsCount
    };
  } catch (error) {
    console.error('Error getting global platform statistics:', error);
    return {
      totalPoolCount: 0,
      totalParticipantsCount: 0
    };
  }
};

// Get the count of pools a user has participated in across all contracts
// export const getUserParticipatedPoolsCount = async (userAddress: string) => {
//   try {
//     console.log(`Getting participated pools count for user ${userAddress}...`);
//     let totalCount = 0;

//     // Check participation in each pool type
//     for (const poolType of Object.keys(POOL_CONTRACTS)) {
//       try {
//         const participatedPools = await getParticipatedPools(userAddress, poolType);
//         console.log(`User ${userAddress} has participated in ${participatedPools.length} pools of ${poolType}`);
//         totalCount += participatedPools.length;
//       } catch (error) {
//         console.warn(`Error getting participated pools for ${poolType}:`, error);
//       }
//     }

//     console.log(`Total participated pools count for user ${userAddress}:`, totalCount);
//     return totalCount;
//   } catch (error) {
//     console.error(`Error getting participated pools count for user ${userAddress}:`, error);
//     return 0;
//   }
// };

// Get detailed pool statistics for a specific pool
export const getPoolDetailedStats = async (poolId: number, poolType: string) => {
  try {
    console.log(`Getting detailed stats for pool ${poolId} of ${poolType}...`);
    const contract = await getAppropriateContract(poolType);

    // Get all stats in parallel for better performance
    const [
      poolStrength,
      poolUsersCount,
      poolLosersCount,
      entryFee,
      // Try to get the winner if the pool is completed
      winner
    ] = await Promise.all([
      contract.poolStrength(poolId).catch(() => ethers.BigNumber.from(0)),
      contract.getpoolUsers(poolId).catch(() => 0),
      contract.getpoolLosers(poolId).catch(() => 0),
      contract.entryFee().catch(() => ethers.BigNumber.from(0)),
      // Only try to get the winner if the pool is completed
      getPoolWinner(poolId, poolType).catch(() => null)
    ]);

    // Calculate the pool prize
    const poolPrize = ethers.BigNumber.from(poolUsersCount).mul(entryFee);

    return {
      poolStrength: ethers.utils.formatUnits(poolStrength, 18),
      poolUsersCount: Number(poolUsersCount),
      poolLosersCount: Number(poolLosersCount),
      entryFee: ethers.utils.formatUnits(entryFee, 18),
      poolPrize: ethers.utils.formatUnits(poolPrize, 18),
      winner
    };
  } catch (error) {
    console.error(`Error getting detailed stats for pool ${poolId} of ${poolType}:`, error);
    return {
      poolStrength: '0',
      poolUsersCount: 0,
      poolLosersCount: 0,
      entryFee: '0',
      poolPrize: '0',
      winner: null
    };
  }
};

// Get the winner of a completed pool
export const getPoolWinner = async (poolId: number, poolType: string) => {
  try {
    console.log(`Getting winner for pool ${poolId} of ${poolType}...`);
    const contract = await getAppropriateContract(poolType);

    // Try the new function first (if it exists in the updated contracts)
    try {
      const winner = await contract.getPoolWinner(poolId);
      if (winner && winner !== ethers.constants.AddressZero) {
        console.log(`Winner for pool ${poolId} of ${poolType}:`, winner);
        return winner;
      }
    } catch (e) {
      // If the new function doesn't exist, try an alternative approach
      console.warn(`getPoolWinner function not found for ${poolType}, trying alternative approach`);

      // Check if the pool is completed
      const currentPoolId = await getPoolCounter(poolType);
      if (poolId < Number(currentPoolId)) {
        // Pool is completed, try to find the winner by checking winning amounts
        try {
          // Get all users in the pool
          const usersCount = await contract.getpoolUsers(poolId);

          // Check each user for a winning amount
          for (let i = 0; i < Number(usersCount); i++) {
            try {
              const user = await contract.poolUsers(poolId, i);
              const winningAmount = await contract.userWinningAmount(poolId, user);

              if (Number(winningAmount) > 0) {
                console.log(`Found winner for pool ${poolId} of ${poolType}:`, user);
                return user;
              }
            } catch (userError) {
              // Ignore errors for individual user checks
            }
          }
        } catch (poolError) {
          console.warn(`Error checking users for pool ${poolId} of ${poolType}:`, poolError);
        }
      }
    }

    // If no winner found or pool not completed
    return null;
  } catch (error) {
    console.error(`Error getting winner for pool ${poolId} of ${poolType}:`, error);
    return null;
  }
};

// Get user's total level earnings for a specific raffle contract
export const getUserLevelEarnings = async (userAddress: string, poolType: string): Promise<ethers.BigNumber> => {
  try {
    console.log(`Getting level earnings for user ${userAddress} from ${poolType}...`);
    const contract = await getAppropriateContract(poolType);

    // Try the new function first (if it exists in the updated contracts)
    try {
      const earnings = await contract.getUserLevelEarnings(userAddress);
      console.log(`User ${userAddress} level earnings from ${poolType}:`, ethers.utils.formatUnits(earnings, 18), 'USDT');
      return earnings;
    } catch (e) {
      // If the new function doesn't exist, try an alternative approach
      console.warn(`getUserLevelEarnings function not found for ${poolType}, trying alternative approach`);

      // Try to get total earnings and subtract pool earnings if possible
      try {
        const totalEarnings = await contract.getUserTotalEarnings(userAddress);
        const poolEarnings = await contract.getUserPoolEarnings(userAddress);
        const levelEarnings = totalEarnings.sub(poolEarnings);

        console.log(`User ${userAddress} level earnings from ${poolType} (calculated):`, ethers.utils.formatUnits(levelEarnings, 18), 'USDT');
        return levelEarnings;
      } catch (calcError) {
        console.warn(`Error calculating level earnings:`, calcError);
        return ethers.BigNumber.from(0);
      }
    }
  } catch (error) {
    console.error(`Error getting level earnings for user ${userAddress} from ${poolType}:`, error);
    return ethers.BigNumber.from(0);
  }
};

// Get user's total pool earnings for a specific raffle contract
export const getUserPoolEarnings = async (userAddress: string, poolType: string): Promise<ethers.BigNumber> => {
  try {
    console.log(`Getting pool earnings for user ${userAddress} from ${poolType}...`);
    const contract = await getAppropriateContract(poolType);

    // Try the new function first (if it exists in the updated contracts)
    try {
      const earnings = await contract.getUserPoolEarnings(userAddress);
      console.log(`User ${userAddress} pool earnings from ${poolType}:`, ethers.utils.formatUnits(earnings, 18), 'USDT');
      return earnings;
    } catch (e) {
      // If the new function doesn't exist, try an alternative approach
      console.warn(`getUserPoolEarnings function not found for ${poolType}, trying alternative approach`);

      // Try to calculate pool earnings by summing up all winning amounts
      try {
        let totalPoolEarnings = ethers.BigNumber.from(0);

        // Get the current pool counter
        const poolCounter = await getPoolCounter(poolType);

        // Check each pool for winnings
        for (let poolId = 0; poolId <= Number(poolCounter); poolId++) {
          try {
            const winningAmount = await contract.userWinningAmount(poolId, userAddress);
            if (Number(winningAmount) > 0) {
              console.log(`User ${userAddress} has won ${ethers.utils.formatUnits(winningAmount, 18)} USDT in pool ${poolId} of ${poolType}`);
              totalPoolEarnings = totalPoolEarnings.add(winningAmount);
            }
          } catch (poolError) {
            // Ignore errors for individual pool checks
          }
        }

        console.log(`User ${userAddress} total pool earnings from ${poolType} (calculated):`, ethers.utils.formatUnits(totalPoolEarnings, 18), 'USDT');
        return totalPoolEarnings;
      } catch (calcError) {
        console.warn(`Error calculating pool earnings:`, calcError);
        return ethers.BigNumber.from(0);
      }
    }
  } catch (error) {
    console.error(`Error getting pool earnings for user ${userAddress} from ${poolType}:`, error);
    return ethers.BigNumber.from(0);
  }
};

// Get all earnings data for a user from a specific raffle contract
export const getUserRaffleEarnings = async (userAddress: string, poolType: string): Promise<EarningsData> => {
  try {
    console.log(`Getting all earnings data for user ${userAddress} from ${poolType}...`);

    // Get all earnings in parallel for better performance
    const [
      levelEarnings,
      poolEarnings
    ] = await Promise.all([
      getUserLevelEarnings(userAddress, poolType),
      getUserPoolEarnings(userAddress, poolType)
    ]);

    // Calculate total earnings
    const totalEarnings = levelEarnings.add(poolEarnings);

    return {
      totalLevelEarnings: ethers.utils.formatUnits(levelEarnings, 18),
      totalPoolEarnings: ethers.utils.formatUnits(poolEarnings, 18),
      totalEarnings: ethers.utils.formatUnits(totalEarnings, 18)
    };
  } catch (error) {
    console.error(`Error getting earnings data for user ${userAddress} from ${poolType}:`, error);
    return {
      totalLevelEarnings: '0',
      totalPoolEarnings: '0',
      totalEarnings: '0'
    };
  }
};

// Get earnings data for a user from all raffle contracts
export const getUserAllRaffleEarnings = async (userAddress: string): Promise<{[poolType: string]: EarningsData}> => {
  try {
    console.log(`Getting earnings data for user ${userAddress} from all raffle contracts...`);

    const allEarnings: {[poolType: string]: EarningsData} = {};

    // Get earnings from each pool type
    for (const poolType of Object.keys(POOL_CONTRACTS)) {
      try {
        const earnings = await getUserRaffleEarnings(userAddress, poolType);

        // Only add to the result if there are any earnings
        if (parseFloat(earnings.totalEarnings) > 0) {
          allEarnings[poolType] = earnings;
        }
      } catch (error) {
        console.warn(`Error getting earnings for ${poolType}:`, error);
      }
    }

    return allEarnings;
  } catch (error) {
    console.error(`Error getting all raffle earnings for user ${userAddress}:`, error);
    return {};
  }
};
