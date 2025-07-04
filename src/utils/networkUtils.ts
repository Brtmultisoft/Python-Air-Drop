import { CHAIN_ID } from '../config';

// BSC Mainnet network parameters
const BSC_MAINNET = {
  chainId: '0x38', // 56 in hex
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};

/**
 * Checks if the user is on the correct network
 * @returns Promise<boolean> True if on correct network
 */
export const checkNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) return false;
  
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(currentChainId, 16) === CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

/**
 * Switches the network to the correct one
 * @returns Promise<boolean> True if switch was successful
 */
export const switchNetwork = async (): Promise<boolean> => {
  if (!window.ethereum) return false;
  
  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BSC_MAINNET],
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', switchError);
    return false;
  }
};
