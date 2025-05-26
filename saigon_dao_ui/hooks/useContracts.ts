import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  CONTRACT_ADDRESSES, 
  MOCK_TOKEN_ABI, 
  VAULT_ABI, 
  SAIGON_LST_ABI,
  TOKENS,
  VAULTS,
  LST_POOLS,
  getContractAddress 
} from '../config/contracts'

// Hook to get token balance
export function useTokenBalance(tokenAddress: `0x${string}`, userAddress?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress }
  })
}

// Hook to get token allowance
export function useTokenAllowance(
  tokenAddress: `0x${string}`, 
  ownerAddress?: `0x${string}`, 
  spenderAddress?: `0x${string}`
) {
  return useReadContract({
    address: tokenAddress,
    abi: MOCK_TOKEN_ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { enabled: !!(ownerAddress && spenderAddress) }
  })
}

// Hook for token operations (vBTC, VNST)
export function useToken(tokenSymbol: 'vBTC' | 'VNST') {
  const { address } = useAccount()
  const token = TOKENS[tokenSymbol]
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read token balance
  const balance = useTokenBalance(token.address, address)

  // Read token allowance for vault
  const vaultAllowance = useTokenAllowance(token.address, address, VAULTS.vBTC_VNST.address)

  // Approve token spending
  const approve = async (spender: `0x${string}`, amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, token.decimals)
      await writeContract({
        address: token.address,
        abi: token.abi,
        functionName: 'approve',
        args: [spender, parsedAmount]
      })
      toast.success(`Approving ${tokenSymbol}...`)
    } catch (error) {
      toast.error(`Failed to approve ${tokenSymbol}`)
      console.error('Approve error:', error)
    }
  }

  // Mint tokens (for testing)
  const mint = async (amount: string) => {
    if (!address) return
    try {
      const parsedAmount = parseUnits(amount, token.decimals)
      await writeContract({
        address: token.address,
        abi: token.abi,
        functionName: 'mint',
        args: [address, parsedAmount]
      })
      toast.success(`Minting ${amount} ${tokenSymbol}...`)
    } catch (error) {
      toast.error(`Failed to mint ${tokenSymbol}`)
      console.error('Mint error:', error)
    }
  }

  return {
    token,
    balance: balance.data ? formatUnits(balance.data, token.decimals) : '0',
    isLoadingBalance: balance.isLoading,
    vaultAllowance: vaultAllowance.data ? formatUnits(vaultAllowance.data, token.decimals) : '0',
    approve,
    mint,
    isPending: isPending || isConfirming,
    isConfirmed,
    hash
  }
}

// Hook for vault operations (liquidity pool)
export function useVault() {
  const { address } = useAccount()
  const vault = VAULTS.vBTC_VNST
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read vault reserves
  const reserves = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'getReserves'
  })

  // Read vault price
  const price = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'getPrice'
  })

  // Read vault total supply
  const totalSupply = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'totalSupply'
  })

  // Read user's vault balance (LP tokens)
  const userBalance = useReadContract({
    address: vault.address,
    abi: vault.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Add liquidity to vault
  const addLiquidity = async (amountA: string, amountB: string) => {
    try {
      const parsedAmountA = parseUnits(amountA, vault.tokenA.decimals)
      const parsedAmountB = parseUnits(amountB, vault.tokenB.decimals)
      
      await writeContract({
        address: vault.address,
        abi: vault.abi,
        functionName: 'addLiquidity',
        args: [parsedAmountA, parsedAmountB]
      })
      toast.success('Adding liquidity...')
    } catch (error) {
      toast.error('Failed to add liquidity')
      console.error('Add liquidity error:', error)
    }
  }

  // Remove liquidity from vault
  const removeLiquidity = async (shares: string) => {
    try {
      const parsedShares = parseUnits(shares, 18)
      await writeContract({
        address: vault.address,
        abi: vault.abi,
        functionName: 'removeLiquidity',
        args: [parsedShares]
      })
      toast.success('Removing liquidity...')
    } catch (error) {
      toast.error('Failed to remove liquidity')
      console.error('Remove liquidity error:', error)
    }
  }

  return {
    vault,
    reserves: reserves.data ? {
      reserveA: formatUnits(reserves.data[0], vault.tokenA.decimals),
      reserveB: formatUnits(reserves.data[1], vault.tokenB.decimals)
    } : { reserveA: '0', reserveB: '0' },
    price: price.data ? formatEther(price.data) : '0',
    totalSupply: totalSupply.data ? formatEther(totalSupply.data) : '0',
    userBalance: userBalance.data ? formatEther(userBalance.data) : '0',
    addLiquidity,
    removeLiquidity,
    isPending: isPending || isConfirming,
    isConfirmed,
    hash
  }
}

// Hook for LST operations using SGLP (direct underlying token staking)
export function useLST(poolKey: 'vBTC' | 'VNST') {
  const { address } = useAccount()
  const pool = LST_POOLS[poolKey]
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read user's LST token balance (sgVNST or sgvBTC) from the LST token contract
  const stakedBalance = useReadContract({
    address: pool.lstToken,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read user's underlying token balance (VNST or vBTC)
  const underlyingBalance = useReadContract({
    address: pool.underlying.address,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read underlying token allowance for SGLP contract
  const underlyingAllowance = useReadContract({
    address: pool.underlying.address,
    abi: MOCK_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, pool.pool] : undefined,
    query: { 
      enabled: !!address,
      refetchInterval: 3000 // Refetch every 3 seconds to catch approval updates
    }
  })

  // Read exchange rate from SGLP contract
  const exchangeRate = useReadContract({
    address: pool.pool,
    abi: pool.abi,
    functionName: 'getExchangeRate',
    query: { enabled: true }
  })

  // Approve underlying tokens for SGLP contract
  const approveUnderlyingToken = async (amount: string) => {
    try {
      // Approve a very large amount (max uint256) to avoid multiple approvals
      const maxAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
      await writeContract({
        address: pool.underlying.address,
        abi: MOCK_TOKEN_ABI,
        functionName: 'approve',
        args: [pool.pool, maxAmount]
      })
      toast.success(`Approving ${poolKey} for staking...`)
    } catch (error) {
      toast.error(`Failed to approve ${poolKey}`)
      console.error('Approve underlying token error:', error)
    }
  }

  // Stake underlying tokens directly to receive LST tokens
  const stake = async (amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, pool.underlying.decimals)
      await writeContract({
        address: pool.pool,
        abi: pool.abi,
        functionName: 'provideLiquidity',
        args: [parsedAmount]
      })
      toast.success(`Staking ${amount} ${poolKey} to receive sg${poolKey}...`)
    } catch (error) {
      toast.error(`Failed to stake ${poolKey}`)
      console.error('Stake error:', error)
    }
  }

  // Unstake LST tokens to get underlying tokens back
  const unstake = async (amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, 18) // LST tokens are 18 decimals
      await writeContract({
        address: pool.pool,
        abi: pool.abi,
        functionName: 'unstake',
        args: [parsedAmount]
      })
      toast.success(`Unstaking sg${poolKey} to receive ${poolKey}...`)
    } catch (error) {
      toast.error('Failed to unstake')
      console.error('Unstake error:', error)
    }
  }

  return {
    pool,
    lstTokenAddress: pool.lstToken,
    balances: {
      staked: stakedBalance.data ? formatEther(stakedBalance.data) : '0',
      underlying: underlyingBalance.data ? formatUnits(underlyingBalance.data, pool.underlying.decimals) : '0',
      lp: '0', // Deprecated - keeping for backward compatibility
    },
    allowance: underlyingAllowance.data ? formatUnits(underlyingAllowance.data, pool.underlying.decimals) : '0',
    exchangeRate: exchangeRate.data ? formatEther(exchangeRate.data) : '1.0',
    approveUnderlyingToken,
    approveLPToken: approveUnderlyingToken, // Alias for backward compatibility
    stake,
    unstake,
    isPending: isPending || isConfirming,
    isConfirmed,
    hash
  }
}

// Combined hook for easier usage
export function useContracts() {
  const vBTC = useToken('vBTC')
  const VNST = useToken('VNST')
  const vault = useVault()
  const vBTCLST = useLST('vBTC')
  const VNSTLST = useLST('VNST')

  // Lending operations (mock implementation for MVP)
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // Mock lending functions (replace with actual compound integration)
  const supplyToCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      // In a real implementation, this would interact with Compound protocol
      toast.success('Supply functionality will be implemented with Compound integration')
    } catch (error) {
      toast.error('Supply failed')
      console.error('Supply error:', error)
    }
  }

  const borrowFromCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      // In a real implementation, this would interact with Compound protocol
      toast.success('Borrow functionality will be implemented with Compound integration')
    } catch (error) {
      toast.error('Borrow failed')
      console.error('Borrow error:', error)
    }
  }

  const withdrawFromCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      // In a real implementation, this would interact with Compound protocol
      toast.success('Withdraw functionality will be implemented with Compound integration')
    } catch (error) {
      toast.error('Withdraw failed')
      console.error('Withdraw error:', error)
    }
  }

  const repayCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      // In a real implementation, this would interact with Compound protocol
      toast.success('Repay functionality will be implemented with Compound integration')
    } catch (error) {
      toast.error('Repay failed')
      console.error('Repay error:', error)
    }
  }

  // Mock read functions for lending balances
  const getSuppliedBalance = (tokenAddress: `0x${string}`) => {
    return useReadContract({
      address: tokenAddress,
      abi: MOCK_TOKEN_ABI,
      functionName: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'], // Mock
    })
  }

  const getBorrowedBalance = (tokenAddress: `0x${string}`) => {
    return useReadContract({
      address: tokenAddress,
      abi: MOCK_TOKEN_ABI,
      functionName: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'], // Mock
    })
  }

  return {
    tokens: { vBTC, VNST },
    vault,
    lst: { vBTC: vBTCLST, VNST: VNSTLST },
    // Lending functions
    supplyToCompound,
    borrowFromCompound,
    withdrawFromCompound,
    repayCompound,
    getSuppliedBalance,
    getBorrowedBalance,
    isSupplyPending: isPending || isConfirming,
    isBorrowPending: isPending || isConfirming,
    isWithdrawPending: isPending || isConfirming,
    isRepayPending: isPending || isConfirming,
  }
}

// Legacy compatibility functions
export function useTokenOperations(tokenSymbol: 'vBTC' | 'VNST') {
  const token = useToken(tokenSymbol)
  return {
    token: token.token,
    balance: token.balance,
    isLoadingBalance: token.isLoadingBalance,
    mintToken: () => token.mint('1000'),
    isMinting: token.isPending,
  }
}

export function useVaultOperations() {
  const vault = useVault()
  const vBTC = useToken('vBTC')
  const VNST = useToken('VNST')
  
  return {
    vault: vault.vault,
    reserves: vault.reserves,
    price: vault.price,
    userBalance: vault.userBalance,
    addLiquidity: {
      write: (amountA?: string, amountB?: string) => {
        if (amountA && amountB) vault.addLiquidity(amountA, amountB)
      },
      isLoading: vault.isPending,
      setAmountA: () => {},
      setAmountB: () => {},
      amountA: '',
      amountB: '',
    },
    removeLiquidity: {
      write: (shares?: string) => {
        if (shares) vault.removeLiquidity(shares)
      },
      isLoading: vault.isPending,
      setShares: () => {},
      shares: '',
    },
    allowances: {
      vBTC: vBTC.vaultAllowance,
      VNST: VNST.vaultAllowance
    },
    approve: {
      vBTC: () => vBTC.approve(vault.vault.address, '1000000'),
      VNST: () => VNST.approve(vault.vault.address, '1000000'),
    },
    isLoadingApprovals: vBTC.isPending || VNST.isPending,
  }
}

export function useLSTOperations(tokenSymbol: 'vBTC' | 'VNST') {
  const lst = useLST(tokenSymbol)
  
  return {
    lstPool: lst.pool,
    balances: {
      lst: lst.balances.staked,
      lp: lst.balances.lp,
    },
    allowance: lst.allowance,
    stake: {
      write: (amount?: string) => {
        if (amount) lst.stake(amount)
      },
      isLoading: lst.isPending,
      setAmount: () => {},
      amount: '',
    },
    unstake: {
      write: (amount?: string) => {
        if (amount) lst.unstake(amount)
      },
      isLoading: lst.isPending,
      setAmount: () => {},
      amount: '',
    },
    approveLPToken: () => lst.approveLPToken('1000000'),
    isLoadingApproval: lst.isPending,
  }
}

// Utility functions for formatting
export const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
  if (!balance) return '0'
  return formatUnits(balance, decimals)
}

export const formatDisplayBalance = (balance: bigint | undefined, decimals: number = 18, precision: number = 4) => {
  if (!balance) return '0'
  const formatted = formatUnits(balance, decimals)
  return parseFloat(formatted).toFixed(precision)
}
