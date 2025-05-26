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

// Hook for LST operations (LP token staking)
export function useLST(poolKey: 'vBTC' | 'VNST') {
  const { address } = useAccount()
  const pool = LST_POOLS[poolKey]
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Read user's staked balance (LST tokens)
  const stakedBalance = useReadContract({
    address: pool.pool,
    abi: pool.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read user's LP token balance (to stake)
  const lpBalance = useReadContract({
    address: pool.lpToken,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read LP token allowance for staking
  const lpAllowance = useReadContract({
    address: pool.lpToken,
    abi: MOCK_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, pool.pool] : undefined,
    query: { enabled: !!address }
  })

  // Approve LP tokens for staking
  const approveLPToken = async (amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, 18)
      await writeContract({
        address: pool.lpToken,
        abi: MOCK_TOKEN_ABI,
        functionName: 'approve',
        args: [pool.pool, parsedAmount]
      })
      toast.success('Approving LP tokens for staking...')
    } catch (error) {
      toast.error('Failed to approve LP tokens')
      console.error('Approve LP error:', error)
    }
  }

  // Stake LP tokens to receive LST tokens
  const stake = async (amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, 18)
      await writeContract({
        address: pool.pool,
        abi: pool.abi,
        functionName: 'stake',
        args: [parsedAmount]
      })
      toast.success(`Staking ${poolKey} LP tokens to receive sg${poolKey}...`)
    } catch (error) {
      toast.error('Failed to stake LP tokens')
      console.error('Stake error:', error)
    }
  }

  // Unstake LST tokens to get LP tokens back
  const unstake = async (amount: string) => {
    try {
      const parsedAmount = parseUnits(amount, 18)
      await writeContract({
        address: pool.pool,
        abi: pool.abi,
        functionName: 'unstake',
        args: [parsedAmount]
      })
      toast.success(`Unstaking sg${poolKey} to receive ${poolKey} LP tokens...`)
    } catch (error) {
      toast.error('Failed to unstake')
      console.error('Unstake error:', error)
    }
  }

  return {
    pool,
    balances: {
      staked: stakedBalance.data ? formatEther(stakedBalance.data) : '0',
      lp: lpBalance.data ? formatEther(lpBalance.data) : '0',
    },
    allowance: lpAllowance.data ? formatEther(lpAllowance.data) : '0',
    approveLPToken,
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
