// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../Liquidity/SGLP.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "../../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import { vBTC_VNST_Vault } from "../Liquidity/vBTC_VNST.sol";

contract SaigonLending is Ownable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 private constant MAX_COLLATERAL_RATIO = 75; // 75% LTV ratio
    uint256 private constant BASE_INTEREST_RATE = 5; // 5% base interest rate
    uint256 private constant BLOCKS_PER_DAY = 7200; // ~12 seconds per block, 86400/12
    uint256 private constant MAX_LOAN_DURATION_DAYS = 30; // 30 day maximum loan duration

    // Struct to store loan details
    struct Loan {
        address borrower;
        address collateralToken;
        uint256 collateralAmount;
        address borrowToken;
        uint256 borrowAmount;
        uint256 interestRate;
        uint256 startBlock;
        uint256 dueBlock;
        bool active;
    }

    // Pool mapping for collateral and borrow tokens
    mapping(address => SGLP) public SGLiquidityPools;
    
    // Token price oracle (mock for now)
    mapping(address => uint256) public tokenPrices; // Price in USD with 18 decimals

    // Loan tracking
    mapping(address => mapping(uint256 => Loan)) public userLoans;
    mapping(address => uint256) public userLoanCount;
    uint256 public totalLoans;

    // Add mapping for token swap vaults
    mapping(address => mapping(address => address)) public tokenSwapVaults;

    // Events
    event LoanCreated(
        address indexed borrower,
        uint256 indexed loanId,
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount,
        uint256 interestRate,
        uint256 dueBlock
    );
    event LoanRepaid(address indexed borrower, uint256 indexed loanId);
    event LoanLiquidated(address indexed borrower, uint256 indexed loanId);
    event PoolRegistered(address indexed tokenAddress, address indexed poolAddress);
    event PriceUpdated(address indexed tokenAddress, uint256 price);
    event SwapVaultRegistered(address indexed token1, address indexed token2, address indexed vaultAddress);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a liquidity pool for a specific token
     * @param token Token address
     * @param pool SGLP pool address
     */
    function registerPool(address token, address pool) external onlyOwner {
        require(token != address(0), "SaigonLending: Invalid token address");
        require(pool != address(0), "SaigonLending: Invalid pool address");
        SGLiquidityPools[token] = SGLP(pool);
        emit PoolRegistered(token, pool);
    }

    /**
     * @dev Register a token swap vault, this is temporary, in real world implementation, we need to route the correct liquidity flow, or use our own liquidity to allow swapping
     * @param token1 First token in the pair
     * @param token2 Second token in the pair
     * @param vaultAddress Address of the token swap vault
     */
    function registerSwapVault(address token1, address token2, address vaultAddress) external onlyOwner {
        require(token1 != address(0) && token2 != address(0), "SaigonLending: Invalid token address");
        require(vaultAddress != address(0), "SaigonLending: Invalid vault address");
        tokenSwapVaults[token1][token2] = vaultAddress;
        tokenSwapVaults[token2][token1] = vaultAddress; // Register for both directions
        emit SwapVaultRegistered(token1, token2, vaultAddress);
    }

    /**
     * @dev Update token price in the oracle (mock)
     * @param token Token address
     * @param price Price with 18 decimals
     */
    function updateTokenPrice(address token, uint256 price) external onlyOwner {
        require(token != address(0), "SaigonLending: Invalid token address");
        require(price > 0, "SaigonLending: Invalid price");
        tokenPrices[token] = price;
        emit PriceUpdated(token, price);
    }

    /**
     * @dev Calculate loan details before borrowing
     * @param collateralToken Collateral token address
     * @param collateralAmount Amount of collateral
     * @param borrowToken Borrow token address
     * @param borrowAmount Amount to borrow
     * @param durationDays Loan duration in days
     * @return interestRate Interest rate (18 decimals)
     * @return dueBlock Block number when loan is due
     * @return maxBorrowable Maximum borrowable amount
     * @return isValid True if the loan parameters are valid
     */
    function calculateLoanDetails(
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount,
        uint256 durationDays
    ) 
        external 
        view 
        returns (
            uint256 interestRate,
            uint256 dueBlock,
            uint256 maxBorrowable,
            bool isValid
        ) 
    {
        require(tokenPrices[collateralToken] > 0, "SaigonLending: Collateral token price not set");
        require(tokenPrices[borrowToken] > 0, "SaigonLending: Borrow token price not set");
        
        // Calculate collateral value in USD
        uint256 collateralValue = (collateralAmount * tokenPrices[collateralToken]) / 1 ether;
        
        // Calculate maximum borrowable amount (75% of collateral value)
        maxBorrowable = (collateralValue * MAX_COLLATERAL_RATIO / 100) * 1 ether / tokenPrices[borrowToken];
        
        // Calculate interest rate based on utilization and duration
        // Base rate + utilization adjustment + duration adjustment
        uint256 utilizationRatio = (borrowAmount * 100) / maxBorrowable;
        uint256 durationAdjustment = 0;
        
        if (durationDays <= 7) {
            durationAdjustment = 0;
        } else if (durationDays <= 14) {
            durationAdjustment = 1;
        } else if (durationDays <= 30) {
            durationAdjustment = 2;
        } else {
            return (0, 0, maxBorrowable, false); // Invalid duration
        }
        
        interestRate = BASE_INTEREST_RATE + (utilizationRatio / 10) + durationAdjustment;
        
        // Calculate due block
        dueBlock = block.number + (durationDays * BLOCKS_PER_DAY);
        
        // Check if loan is valid
        isValid = borrowAmount <= maxBorrowable && 
                  SGLiquidityPools[borrowToken] != SGLP(address(0)) &&
                  borrowAmount > 0;
                  
        return (interestRate, dueBlock, maxBorrowable, isValid);
    }

    /**
     * @dev Borrow tokens with collateral
     * @param collateralToken Collateral token address
     * @param collateralAmount Amount of collateral
     * @param borrowToken Borrow token address
     * @param borrowAmount Amount to borrow
     * @param durationDays Loan duration in days
     */
    function borrow(
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount,
        uint256 durationDays
    ) external {
        // Get loan details
        (uint256 interestRate, uint256 dueBlock, uint256 maxBorrowable, bool isValid) = 
            this.calculateLoanDetails(
                collateralToken,
                collateralAmount,
                borrowToken,
                borrowAmount,
                durationDays
            );
        
        require(isValid, "SaigonLending: Invalid loan parameters");
        require(borrowAmount <= maxBorrowable, "SaigonLending: Borrow amount exceeds collateral ratio");
        require(durationDays <= MAX_LOAN_DURATION_DAYS, "SaigonLending: Loan duration too long");
        
        SGLP pool = SGLiquidityPools[borrowToken];
        require(address(pool) != address(0), "SaigonLending: No pool for borrow token");
        
        // Transfer collateral to this contract
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // Create loan record
        uint256 loanId = userLoanCount[msg.sender];
        userLoans[msg.sender][loanId] = Loan({
            borrower: msg.sender,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            borrowToken: borrowToken,
            borrowAmount: borrowAmount,
            interestRate: interestRate,
            startBlock: block.number,
            dueBlock: dueBlock,
            active: true
        });
        
        userLoanCount[msg.sender]++;
        totalLoans++;
        
        // Call the pool to borrow
        pool.lend(msg.sender, borrowAmount);
        
        emit LoanCreated(
            msg.sender,
            loanId,
            collateralToken,
            collateralAmount,
            borrowToken,
            borrowAmount,
            interestRate,
            dueBlock
        );
    }

    /**
     * @dev Calculate repayment amount with interest
     * @param borrower Borrower address
     * @param loanId Loan ID
     */
    function calculateRepaymentAmount(address borrower, uint256 loanId) public view returns (uint256) {
        Loan storage loan = userLoans[borrower][loanId];
        require(loan.active, "SaigonLending: Loan not active");
        
        // Calculate blocks elapsed
        uint256 blocksElapsed = block.number - loan.startBlock;
        
        // Calculate interest based on time elapsed
        uint256 totalBlocks = loan.dueBlock - loan.startBlock;
        uint256 interestAmount = (loan.borrowAmount * loan.interestRate * blocksElapsed) / (totalBlocks * 100);
        
        return loan.borrowAmount + interestAmount;
    }

    /**
     * @dev Repay a loan
     * @param loanId Loan ID to repay
     */
    function repay(uint256 loanId) external {
        Loan storage loan = userLoans[msg.sender][loanId];
        require(loan.active, "SaigonLending: Loan not active");
        
        // Calculate repayment amount
        uint256 repaymentAmount = calculateRepaymentAmount(msg.sender, loanId);
        SGLP pool = SGLiquidityPools[loan.borrowToken];
        
        // Transfer borrowed tokens from borrower to this contract
        IERC20(loan.borrowToken).safeTransferFrom(msg.sender, address(this), repaymentAmount);
        
        // Calculate interest
        uint256 interestAmount = repaymentAmount - loan.borrowAmount;
        
        // Approve the pool to take the borrowed amount back
        IERC20(loan.borrowToken).approve(address(pool), loan.borrowAmount);
        
        // Call pool to repay the loan amount
        pool.repay(msg.sender, loan.borrowAmount);
        
        // Handle the interest (in a real implementation, would swap and add to liquidity)
        // For now, we're just sending it to the pool address
        if (interestAmount > 0) {
            IERC20(loan.borrowToken).safeTransfer(address(pool), interestAmount);
        }
        
        // Return collateral to borrower
        IERC20(loan.collateralToken).safeTransfer(msg.sender, loan.collateralAmount);
        
        // Update loan status
        loan.active = false;
        
        emit LoanRepaid(msg.sender, loanId);
    }

    /**
     * @dev Check if a loan is eligible for liquidation
     * @param borrower Borrower address
     * @param loanId Loan ID
     */
    function isLiquidatable(address borrower, uint256 loanId) public view returns (bool) {
        Loan storage loan = userLoans[borrower][loanId];
        
        if (!loan.active) return false;
        
        // Check if loan is past due
        if (block.number > loan.dueBlock) {
            return true;
        }
        
        // Check if collateral value has dropped below required ratio
        uint256 collateralValue = (loan.collateralAmount * tokenPrices[loan.collateralToken]) / 1 ether;
        uint256 borrowValue = (loan.borrowAmount * tokenPrices[loan.borrowToken]) / 1 ether;
        
        // Loan is liquidatable if collateral value falls below 125% of borrowed value
        // (inverse of 75% max LTV = 100/75 * 0.75 = 1.25 or 125%)
        return collateralValue < (borrowValue * 125) / 100;
    }

    /**
     * @dev Liquidate an eligible loan
     * @param borrower Borrower address
     * @param loanId Loan ID
     */
    function liquidate(address borrower, uint256 loanId) external onlyOwner {
        require(isLiquidatable(borrower, loanId), "SaigonLending: Loan not liquidatable");
        
        Loan storage loan = userLoans[borrower][loanId];
        SGLP pool = SGLiquidityPools[loan.borrowToken];
        
        // Get the swap vault for this token pair
        address vaultAddress = tokenSwapVaults[loan.collateralToken][loan.borrowToken];
        require(vaultAddress != address(0), "SaigonLending: No swap vault for token pair");
        vBTC_VNST_Vault vault = vBTC_VNST_Vault(vaultAddress);
        
        // Owner sends repayment amount to contract to close the loan
        IERC20(loan.borrowToken).safeTransferFrom(msg.sender, address(this), loan.borrowAmount);
        
        // Approve the pool to take the borrowed amount back
        IERC20(loan.borrowToken).approve(address(pool), loan.borrowAmount);
        
        // Call pool to repay
        pool.repay(borrower, loan.borrowAmount);
        
        // Approve vault to use the collateral token
        IERC20(loan.collateralToken).approve(vaultAddress, loan.collateralAmount);
        
        // Calculate minimum amount we should receive when swapping (with 1% slippage tolerance)
        uint256 expectedOutput = vault.getExpectedOut(
            loan.collateralToken, 
            loan.borrowToken, 
            loan.collateralAmount
        );
        uint256 minAmountOut = (expectedOutput * 99) / 100; // 1% slippage tolerance
        
        // Swap collateral for borrow token using the vault
        uint256 swappedAmount = vault.swap(
            loan.collateralToken,
            loan.borrowToken,
            loan.collateralAmount,
            minAmountOut
        );
        
        // Return the swapped tokens to the liquidity pool to enhance liquidity
        IERC20(loan.borrowToken).approve(address(pool), swappedAmount);
        pool.provideLiquidity(swappedAmount);
        
        // Update loan status
        loan.active = false;
        
        emit LoanLiquidated(borrower, loanId);
    }

    /**
     * @dev Get loan details
     * @param borrower Borrower address
     * @param loanId Loan ID
     */
    function getLoan(address borrower, uint256 loanId) external view returns (
        address, address, uint256, address, uint256, uint256, uint256, uint256, bool
    ) {
        Loan storage loan = userLoans[borrower][loanId];
        return (
            loan.borrower,
            loan.collateralToken,
            loan.collateralAmount,
            loan.borrowToken,
            loan.borrowAmount,
            loan.interestRate,
            loan.startBlock,
            loan.dueBlock,
            loan.active
        );
    }

    /**
     * @dev Get count of loans for a user
     * @param borrower Borrower address
     */
    function getLoanCount(address borrower) external view returns (uint256) {
        return userLoanCount[borrower];
    }
}