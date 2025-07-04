import ReferralRegistryABI from './ReferralRegistry.json';
import RaffleABI1 from './Raffle1.json';
import RaffleABI2 from './Raffle2.json';
import RaffleABI3 from './Raffle3.json';
import RaffleABI4 from './Raffle4.json';
import RaffleABI5 from './Raffle5.json';
import RaffleABI6 from './Raffle6.json';
import IERC20ABI from './IERC20.json';

// For now, we'll use the same ABI for all pools until we get the specific ABIs
// This will be updated when the specific ABIs are provided
const Pool1DollarABI = RaffleABI1;
const Pool2DollarABI = RaffleABI2;
const Pool5DollarABI = RaffleABI3;
const Pool10DollarABI = RaffleABI4;
const Pool20DollarABI = RaffleABI5;
const Pool50DollarABI = RaffleABI6;

export const POOL_ABIS = {
  POOL_1_DOLLAR: Pool1DollarABI,
  POOL_2_DOLLAR: Pool2DollarABI,
  POOL_5_DOLLAR: Pool5DollarABI,
  POOL_10_DOLLAR: Pool10DollarABI,
  POOL_20_DOLLAR: Pool20DollarABI,
  POOL_50_DOLLAR: Pool50DollarABI,
};

export {
  ReferralRegistryABI,
  RaffleABI1,
  RaffleABI2,
  RaffleABI3,
  RaffleABI4,
  RaffleABI5,
  RaffleABI6,
  IERC20ABI
};
