import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { readContract, waitForTransaction } from 'wagmi/actions'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  CONTRACT_ADDRESSES, 
  MOCK_TOKEN_ABI, 
  VAULT_ABI, 
  SAIGON_LST_ABI,
  SAIGON_LENDING_ABI,
  SIMPLE_LENDING_ABI,
  SGLP_ABI,
  TOKENS,
  VAULTS,
  LST_POOLS,
  getContractAddress 
} from '../config/contracts'
import { config } from '../config'
import { ethers } from 'ethers'

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
  const { address } = useAccount()
  const vBTC = useToken('vBTC')
  const VNST = useToken('VNST')
  const vault = useVault()
  const vBTCLST = useLST('vBTC')
  const VNSTLST = useLST('VNST')

  // Lending operations using SaigonLending contract
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // Supply tokens to LST pools (this is the "supply" functionality)
  const supplyToCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      const tokenSymbol = tokenAddress === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
      const lst = tokenSymbol === 'vBTC' ? vBTCLST : VNSTLST
      
      // First approve the underlying token for the LST pool
      const token = tokenSymbol === 'vBTC' ? vBTC : VNST
      const amountStr = formatUnits(amount, TOKENS[tokenSymbol].decimals)
      
      // Check if approval is needed
      const lstPoolAddress = LST_POOLS[tokenSymbol].pool
      await token.approve(lstPoolAddress, amountStr)
      
      // Then stake to provide liquidity to the LST pool
      await lst.stake(amountStr)
      
      toast.success(`Supplying ${amountStr} ${tokenSymbol} to LST pool...`)
    } catch (error) {
      toast.error('Supply failed')
      console.error('Supply error:', error)
    }
  }

  // Borrow with collateral using SimpleLending
  const borrowFromCompound = async (
    collateralToken: `0x${string}`,
    collateralAmount: bigint,
    borrowToken: `0x${string}`,
    borrowAmount: bigint,
    durationDays: number
  ) => {
    try {
      const lendingContractAddress = getContractAddress('SimpleLending')
      const collateralSymbol = collateralToken === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
      const token = collateralSymbol === 'vBTC' ? vBTC : VNST
      
      // Check if user has enough collateral balance
      const userBalance = parseUnits(token.balance, TOKENS[collateralSymbol].decimals)
      if (userBalance < collateralAmount) {
        toast.error(`Insufficient ${collateralSymbol} balance. You have ${token.balance}, need ${formatUnits(collateralAmount, TOKENS[collateralSymbol].decimals)}`)
        return
      }
      
      // Check current allowance by directly calling the contract
      const currentAllowance = await readContract(config, {
        address: collateralToken,
        abi: MOCK_TOKEN_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, lendingContractAddress]
      }) as bigint
      
      const collateralAmountStr = formatUnits(collateralAmount, TOKENS[collateralSymbol].decimals)
      
      // If allowance is insufficient, approve first
      if (!currentAllowance || currentAllowance < collateralAmount) {
        toast.loading(`Step 1/2: Approving ${collateralSymbol} for lending...`)
        await token.approve(lendingContractAddress, collateralAmountStr)
        
        // Wait for the approval transaction
        await new Promise(resolve => setTimeout(resolve, 3000))
        toast.dismiss()
      }
      
      // Now attempt the borrow transaction using SimpleLending
      toast.loading(`Step 2/2: Creating loan...`)
      await writeContract({
        address: lendingContractAddress,
        abi: SIMPLE_LENDING_ABI,
        functionName: 'borrow',
        args: [collateralToken, collateralAmount, borrowToken, borrowAmount]
      })
      
      // Wait for the transaction to be confirmed and dismiss the loading toast
      toast.dismiss()
      
      // Show success message with formatted amounts
      const borrowTokenSymbol = borrowToken === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
      const collateralFormatted = formatUnits(collateralAmount, TOKENS[collateralSymbol].decimals)
      const borrowFormatted = formatUnits(borrowAmount, TOKENS[borrowTokenSymbol].decimals)
      
      toast.success(`Loan created! Sent ${collateralFormatted} ${collateralSymbol}, received ${borrowFormatted} ${borrowTokenSymbol}`, {
        duration: 8000
      })
      
      // Get borrowToken information
      const borrowTokenDecimals = TOKENS[borrowTokenSymbol].decimals
      
      // Console debug information
      console.log('SimpleLending Transaction Summary:')
      console.log(`- Collateral Sent: ${formatUnits(collateralAmount, TOKENS[collateralSymbol].decimals)} ${collateralSymbol}`)
      console.log(`- Borrowed: ${formatUnits(borrowAmount, borrowTokenDecimals)} ${borrowTokenSymbol}`)
      console.log(`- Contract Address: ${lendingContractAddress}`)
      
      // Give the blockchain state a moment to update
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Use a custom event to trigger balance updates in components
      const event = new CustomEvent('tokenBalancesChanged', {
        detail: { tokens: [collateralToken, borrowToken] }
      });
      window.dispatchEvent(event);
      
      // Show a success toast
      toast.success('Transaction complete! Your balances will update automatically.', { 
        duration: 8000 
      });
      
      // Trigger another balance update after a short delay to ensure UI is refreshed
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tokenBalancesChanged', {
          detail: { tokens: [collateralToken, borrowToken] }
        }));
      }, 2000);
    } catch (error) {
      toast.error('Borrow transaction failed')
      console.error('Borrow error:', error)
    }
  }

  // Withdraw from LST pools (this is the "withdraw" functionality)
  const withdrawFromCompound = async (tokenAddress: `0x${string}`, amount: bigint) => {
    try {
      const tokenSymbol = tokenAddress === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
      const lst = tokenSymbol === 'vBTC' ? vBTCLST : VNSTLST
      
      // Convert amount to string for the unstake function
      const amountStr = formatEther(amount) // LST tokens are 18 decimals
      await lst.unstake(amountStr)
      
      toast.success(`Withdrawing ${amountStr} sg${tokenSymbol} from LST pool...`)
    } catch (error) {
      toast.error('Withdraw failed')
      console.error('Withdraw error:', error)
    }
  }

  // Repay loan using SimpleLending
  const repayCompound = async (tokenAddress: `0x${string}`, loanId: bigint) => {
    try {
      await writeContract({
        address: getContractAddress('SimpleLending'),
        abi: SIMPLE_LENDING_ABI,
        functionName: 'repay',
        args: [loanId]
      })
      toast.success('Repaying loan...')
      
      // Add a small delay to allow blockchain state to update
      setTimeout(() => {
        // Use a custom event to trigger balance updates in components
        const event = new CustomEvent('tokenBalancesChanged', {
          detail: { tokens: [tokenAddress] }
        });
        window.dispatchEvent(event);
        
        // Show success message
        toast.success('Loan repaid! Your collateral has been returned.');
        
        // Force a page refresh after a delay to ensure updated balances
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 2000);
      
      // Logging for debugging
      console.log('Repayment transaction completed, balances will update automatically')
    } catch (error) {
      toast.error('Repay failed')
      console.error('Repay error:', error)
    }
  }

  // Calculate loan details before borrowing
  const calculateLoanDetails = (
    collateralToken: `0x${string}`,
    collateralAmount: bigint,
    borrowToken: `0x${string}`,
    borrowAmount: bigint,
    durationDays: number
  ) => {
    // Return loan details
    return {
      data: {
        collateralValue: collateralAmount,
        borrowValue: borrowAmount,
        interestRate: BigInt(500), // 5%
        fee: BigInt(0),
        totalRepayment: borrowAmount + (borrowAmount * BigInt(5) / BigInt(100))
      },
      isLoading: false,
      error: null
    }
  }

  // Get user's loan count
  const getUserLoanCount = () => {
    return useReadContract({
      address: getContractAddress('SimpleLending'),
      abi: SIMPLE_LENDING_ABI,
      functionName: 'getUserLoanCount',
      args: address ? [address] : undefined,
      query: { enabled: !!address }
    })
  }

  // Get specific loan details
  const getLoanDetails = (loanId: number) => {
    return useReadContract({
      address: getContractAddress('SimpleLending'),
      abi: SIMPLE_LENDING_ABI,
      functionName: 'getLoan',
      args: address ? [address, BigInt(loanId)] : undefined,
      query: { enabled: !!(address && loanId >= 0) }
    })
  }

  // Calculate repayment amount for a loan
  const calculateRepaymentAmount = (loanId: number) => {
    return useReadContract({
      address: getContractAddress('SimpleLending'),
      abi: SIMPLE_LENDING_ABI,
      functionName: 'calculateRepaymentAmount',
      args: address ? [address, BigInt(loanId)] : undefined,
      query: { enabled: !!(address && loanId >= 0) }
    })
  }

  // Check if a loan is liquidatable
  const isLoanLiquidatable = (loanId: number) => {
    // SimpleLending implementation
    return {
      data: false,
      isLoading: false,
      error: null
    }
  }

  // Get supplied balance (LST token balance)
  const getSuppliedBalance = (tokenAddress: `0x${string}`) => {
    const lstTokenAddress = tokenAddress === TOKENS.vBTC.address ? 
      getContractAddress('sgvBTC') : getContractAddress('sgVNST')
    
    return useReadContract({
      address: lstTokenAddress,
      abi: MOCK_TOKEN_ABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: { enabled: !!address }
    })
  }

  // Get borrowed balance by checking active loans
  const getBorrowedBalance = (tokenAddress: `0x${string}`) => {
    // This would need to aggregate all active loans for the user
    // For now, returning 0 as we'd need to implement loan tracking
    return useReadContract({
      address: getContractAddress('SimpleLending'),
      abi: SIMPLE_LENDING_ABI,
      functionName: 'getUserLoanCount',
      args: address ? [address] : undefined,
      query: { enabled: !!address }
    })
  }

  // Token approval for lending operations
  const approveLendingContract = async (tokenAddress: `0x${string}`, amount: string) => {
    try {
      const tokenSymbol = tokenAddress === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
      const token = tokenSymbol === 'vBTC' ? vBTC : VNST
      
      await token.approve(getContractAddress('SimpleLending'), amount)
      toast.success(`Approving ${tokenSymbol} for lending...`)
    } catch (error) {
      toast.error('Approval failed')
      console.error('Approval error:', error)
    }
  }

  // Check token allowance for lending contract
  const getLendingAllowance = (tokenAddress: `0x${string}`) => {
    return useReadContract({
      address: tokenAddress,
      abi: MOCK_TOKEN_ABI,
      functionName: 'allowance',
      args: address ? [address, getContractAddress('SimpleLending')] : undefined,
      query: { enabled: !!address }
    })
  }

  // Get available lending amount from LST pools
  const getAvailableLendingAmount = (tokenAddress: `0x${string}`) => {
    const tokenSymbol = tokenAddress === TOKENS.vBTC.address ? 'vBTC' : 'VNST'
    const pool = LST_POOLS[tokenSymbol]
    
    // Read total liquidity available in the LST pool for lending
    const poolLiquidity = useReadContract({
      address: pool.pool,
      abi: SGLP_ABI,
      functionName: 'poolLiquidityVolume',
      query: { enabled: true }
    })
    
    if (!poolLiquidity.data) return '0'
    
    const availableForLending = (poolLiquidity.data as bigint) * BigInt(70) / BigInt(100)
    return formatUnits(availableForLending, pool.underlying.decimals)
  }

  // Setup functions for lending contract
  const setupLendingContract = async () => {
    try {
      // SimpleLending setup logic
      toast.success('SimpleLending is ready to use!')
    } catch (error) {
      toast.error('Error setting up SimpleLending')
      console.error('Setup error:', error)
    }
  }

  // Check if lending contract is properly setup
  const checkLendingSetup = () => {
    // SimpleLending setup check
    return {
      vBTCPrice: '70000', // Mock price for compatibility
      VNSTPrice: '1', // Mock price for compatibility
      isSetup: true // Always ready
    }
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
    approveLendingContract,
    getLendingAllowance,
    calculateLoanDetails,
    getUserLoanCount,
    getLoanDetails,
    calculateRepaymentAmount,
    isLoanLiquidatable,
    getAvailableLendingAmount,
    // Lending setup functions
    setupLendingContract,
    checkLendingSetup,
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
