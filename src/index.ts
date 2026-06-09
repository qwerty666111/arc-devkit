import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// ─── Chain Config ──────────────────────────────────────────────

/**
 * Arc chain configuration — RPC endpoints, explorer, chain IDs.
 */
export const chainConfig = {
  mainnet: {
    chainId: 1440002,
    name: 'Arc Mainnet',
    rpc: 'https://rpc.arc.network',
    explorer: 'https://explorer.arc.network',
    symbol: 'ARC',
    decimals: 18,
  },
  testnet: {
    chainId: 1440001,
    name: 'Arc Testnet',
    rpc: 'https://testnet.rpc.arc.network',
    explorer: 'https://testnet.explorer.arc.network',
    symbol: 'tARC',
    decimals: 18,
  },
} as const;

export type ArcChain = keyof typeof chainConfig;

// ─── Hooks ─────────────────────────────────────────────────────

/**
 * Fetch native ARC balance for an address.
 * Auto-refreshes on new blocks.
 */
export function useBalance(
  provider: ethers.AbstractProvider,
  address: string | null
) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !provider) return;
    setLoading(true);
    try {
      const raw = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch {
      setBalance('0');
    }
    setLoading(false);
  }, [provider, address]);

  useEffect(() => {
    fetchBalance();
    // Subscribe to new blocks
    provider?.on('block', fetchBalance);
    return () => { provider?.off('block', fetchBalance); };
  }, [fetchBalance, provider]);

  return { balance, loading, refetch: fetchBalance };
}

/**
 * Reactive block number — updates on each new block.
 */
export function useBlockNumber(provider: ethers.AbstractProvider) {
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    provider.getBlockNumber().then(setBlockNumber);
    provider.on('block', setBlockNumber);
    return () => { provider.off('block', setBlockNumber); };
  }, [provider]);

  return blockNumber;
}

/**
 * Typed contract instance with auto-reconnect.
 *
 * @example
 * ```tsx
 * const vault = useContract(signer, VAULT_ADDRESS, VAULT_ABI);
 * await vault?.deposit(amount);
 * ```
 */
export function useContract<T extends ethers.Contract>(
  signer: ethers.Signer | null,
  address: string,
  abi: ethers.InterfaceAbi
): T | null {
  const [contract, setContract] = useState<T | null>(null);

  useEffect(() => {
    if (!signer || !address) {
      setContract(null);
      return;
    }
    setContract(new ethers.Contract(address, abi, signer) as T);
  }, [signer, address, abi]);

  return contract;
}

// ─── Pre-compiled ABIs ─────────────────────────────────────────

/**
 * Minimal ERC-20 ABI — balanceOf + transfer
 */
export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
] as const;

/**
 * SavingsVault ABI — deposit, withdraw, balanceOf
 */
export const VAULT_ABI = [
  'function deposit(address token, uint256 amount) external',
  'function withdraw(address token, uint256 amount) external',
  'function balanceOf(address user, address token) external view returns (uint256)',
  'function getPendingReward(address user) external view returns (uint256)',
] as const;