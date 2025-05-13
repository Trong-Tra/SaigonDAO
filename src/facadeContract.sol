// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@liquidity/SGLP.sol";
import "@saigonlst/SaigonLST.sol";
import "@saigonlst/SaigonLSTFactory.sol";
import "@lending/SaigonLending.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev Facade pattern implementation for SaigonDAO protocols
 * Provides simplified interfaces for different user types:
 * - Liquidity providers (stakers)
 * - Borrowers
 * - Protocol owners/administrators
 */
contract SaigonFacade is Ownable {
    using SafeERC20 for IERC20;

    // Core protocol contracts
    SaigonLSTFactory public lstFactory;
    SaigonLending public lendingProtocol;

    // Events
    event PoolAdded(address indexed token, address indexed lstToken, address indexed pool);
    event LiquidityAdded(address indexed user, address indexed token, uint256 amount, uint256 lstAmount);
    event LiquidityRemoved(address indexed user, address indexed token, uint256 lstAmount, uint256 tokenAmount);
    event LoanCreated(address indexed user, address indexed collateralToken, address indexed borrowToken, uint256 loanId);
    event LoanRepaid(address indexed user, uint256 indexed loanId);

    /**
     * @dev Constructor sets up the facade with core protocol contracts
     * @param _lstFactory The factory for creating LST tokens and pools
     * @param _lendingProtocol The lending protocol contract
     */
    constructor(address _lstFactory, address _lendingProtocol) Ownable(msg.sender) {
        require(_lstFactory != address(0), "SaigonFacade: Invalid factory address");
        require(_lendingProtocol != address(0), "SaigonFacade: Invalid lending protocol address");
        lstFactory = SaigonLSTFactory(_lstFactory);
        lendingProtocol = SaigonLending(_lendingProtocol);
    }

    // ======== LIQUIDITY PROVIDER FUNCTIONS ========

    /**
     * @dev Get all available liquidity pools
     * @return poolAddresses Array of pool addresses
     */
    function getAvailablePools() external view returns (address[] memory) {
        return lstFactory.getDeployedLiquidityPools();
    }

    /**
     * @dev Get LST token for a pool
     * @param liquidityPool Address of the liquidity pool
     * @return lstToken Address of the LST token
     */
    function getLSTToken(address liquidityPool) public view returns (address) {
        SGLP pool = SGLP(liquidityPool);
        return address(pool.lstToken());
    }

    /**
     * @dev Get pool for a specific token
     * @param token Address of the token
     * @return pool Address of the liquidity pool for that token
     */
    function getPoolForToken(address token) public view returns (address) {
        uint256 poolCount = lstFactory.getDeployedLiquidityPoolCount();
        
        for (uint256 i = 0; i < poolCount; i++) {
            address poolAddress = lstFactory.deployedLiquidityPools(i);
            SGLP pool = SGLP(poolAddress);
            if (pool.liquidityToken() == token) {
                return poolAddress;
            }
        }
        
        return address(0);
    }

    /**
     * @dev Add liquidity to a pool
     * @param token Address of the token to provide liquidity for
     * @param amount Amount of tokens to provide
     * @return lstAmount Amount of LST tokens received
     */
    function addLiquidity(address token, uint256 amount) external returns (uint256 lstAmount) {
        require(amount > 0, "SaigonFacade: Amount must be greater than 0");
        
        // Find the pool for this token
        address poolAddress = getPoolForToken(token);
        require(poolAddress != address(0), "SaigonFacade: No pool for this token");
        
        SGLP pool = SGLP(poolAddress);
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Approve the pool to spend the tokens
        IERC20(token).approve(poolAddress, amount);
        
        // Get the LST balance before providing liquidity
        address lstTokenAddress = address(pool.lstToken());
        SaigonLST lstToken = SaigonLST(lstTokenAddress);
        uint256 lstBalanceBefore = lstToken.balanceOf(address(this));
        
        // Provide liquidity to the pool
        pool.provideLiquidity(amount);
        
        // Calculate how many LST tokens were received
        uint256 lstBalanceAfter = lstToken.balanceOf(address(this));
        lstAmount = lstBalanceAfter - lstBalanceBefore;
        
        // Transfer the LST tokens to the user
        lstToken.transfer(msg.sender, lstAmount);
        
        emit LiquidityAdded(msg.sender, token, amount, lstAmount);
        return lstAmount;
    }

    /**
     * @dev Remove liquidity from a pool
     * @param lstTokenAddress Address of the LST token
     * @param lstAmount Amount of LST tokens to burn
     * @return tokenAmount Amount of original tokens received
     */
    function removeLiquidity(address lstTokenAddress, uint256 lstAmount) external returns (uint256 tokenAmount) {
        require(lstAmount > 0, "SaigonFacade: Amount must be greater than 0");
        
        // Get the liquidity pool associated with this LST token
        address poolAddress = lstFactory.getLiquidityPool(lstTokenAddress);
        require(poolAddress != address(0), "SaigonFacade: No pool for this LST token");
        
        SGLP pool = SGLP(poolAddress);
        address token = pool.liquidityToken();
        
        // Transfer LST tokens from user to this contract
        SaigonLST lstToken = SaigonLST(lstTokenAddress);
        lstToken.transferFrom(msg.sender, address(this), lstAmount);
        
        // Approve the pool to burn the LST tokens
        lstToken.approve(poolAddress, lstAmount);
        
        // Get token balance before unstaking
        uint256 tokenBalanceBefore = IERC20(token).balanceOf(address(this));
        
        // Remove liquidity from the pool
        pool.unstake(lstAmount);
        
        // Calculate how many original tokens were received
        uint256 tokenBalanceAfter = IERC20(token).balanceOf(address(this));
        tokenAmount = tokenBalanceAfter - tokenBalanceBefore;
        
        // Transfer the original tokens to the user
        IERC20(token).safeTransfer(msg.sender, tokenAmount);
        
        emit LiquidityRemoved(msg.sender, token, lstAmount, tokenAmount);
        return tokenAmount;
    }

    /**
     * @dev Get pool statistics
     * @param poolAddress Address of the liquidity pool
     * @return liquidityVolume Total liquidity in the pool
     * @return lstVolume Total LST tokens minted
     * @return exchangeRate Current exchange rate
     * @return lentVolume Amount of liquidity currently lent out
     */
    function getPoolStats(address poolAddress) external view returns (
        uint256 liquidityVolume,
        uint256 lstVolume,
        uint256 exchangeRate,
        uint256 lentVolume
    ) {
        SGLP pool = SGLP(poolAddress);
        return (
            pool.poolLiquidityVolume(),
            pool.lstVolume(),
            pool.exchangeRate(),
            pool.lentLiquidityVolume()
        );
    }

    // ======== LENDING FUNCTIONS ========

    /**
     * @dev Simulate loan details before borrowing
     * @param collateralToken Address of the collateral token
     * @param collateralAmount Amount of collateral
     * @param borrowToken Address of the token to borrow
     * @param borrowAmount Amount to borrow
     * @param durationDays Loan duration in days
     * @return interestRate Interest rate for the loan
     * @return dueBlock Block number when loan is due
     * @return maxBorrowable Maximum amount that can be borrowed
     * @return isValid Whether the loan parameters are valid
     */
    function simulateLoan(
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount,
        uint256 durationDays
    ) external view returns (
        uint256 interestRate,
        uint256 dueBlock,
        uint256 maxBorrowable,
        bool isValid
    ) {
        return lendingProtocol.calculateLoanDetails(
            collateralToken,
            collateralAmount,
            borrowToken,
            borrowAmount,
            durationDays
        );
    }

    /**
     * @dev Create a loan
     * @param collateralToken Address of the collateral token
     * @param collateralAmount Amount of collateral
     * @param borrowToken Address of the token to borrow
     * @param borrowAmount Amount to borrow
     * @param durationDays Loan duration in days
     * @return loanId ID of the created loan
     */
    function createLoan(
        address collateralToken,
        uint256 collateralAmount,
        address borrowToken,
        uint256 borrowAmount,
        uint256 durationDays
    ) external returns (uint256 loanId) {
        // First approve the lending protocol to take the collateral
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        IERC20(collateralToken).approve(address(lendingProtocol), collateralAmount);
        
        // Get the current loan count for the user (will be the ID of the new loan)
        loanId = lendingProtocol.getLoanCount(msg.sender);
        
        // Create the loan through the lending protocol
        lendingProtocol.borrow(
            collateralToken,
            collateralAmount,
            borrowToken,
            borrowAmount,
            durationDays
        );
        
        emit LoanCreated(msg.sender, collateralToken, borrowToken, loanId);
        return loanId;
    }

    /**
     * @dev Repay a loan
     * @param loanId ID of the loan to repay
     */
    function repayLoan(uint256 loanId) external {
        // Get loan details to check how much to repay
        (
            address borrower,
            ,
            ,
            address borrowToken,
            ,
            ,
            ,
            ,
            bool active
        ) = lendingProtocol.getLoan(msg.sender, loanId);
        
        require(borrower == msg.sender, "SaigonFacade: Not your loan");
        require(active, "SaigonFacade: Loan not active");
        
        // Calculate repayment amount
        uint256 repaymentAmount = lendingProtocol.calculateRepaymentAmount(msg.sender, loanId);
        
        // Transfer the repayment amount from the user
        IERC20(borrowToken).safeTransferFrom(msg.sender, address(this), repaymentAmount);
        IERC20(borrowToken).approve(address(lendingProtocol), repaymentAmount);
        
        // Repay the loan
        lendingProtocol.repay(loanId);
        
        emit LoanRepaid(msg.sender, loanId);
    }

    /**
     * @dev Get all active loans for a user
     * @param user Address of the user
     * @return loanIds Array of loan IDs
     */
    function getActiveLoans(address user) external view returns (uint256[] memory loanIds) {
        uint256 loanCount = lendingProtocol.getLoanCount(user);
        uint256[] memory activeIds = new uint256[](loanCount);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < loanCount; i++) {
            (
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                bool active
            ) = lendingProtocol.getLoan(user, i);
            
            if (active) {
                activeIds[activeCount] = i;
                activeCount++;
            }
        }
        
        // Create a properly sized array for the result
        loanIds = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            loanIds[i] = activeIds[i];
        }
        
        return loanIds;
    }

    /**
     * @dev Check if a loan is liquidatable
     * @param borrower Address of the borrower
     * @param loanId ID of the loan
     * @return isLiquidatable Whether the loan can be liquidated
     */
    function checkLiquidation(address borrower, uint256 loanId) external view returns (bool) {
        return lendingProtocol.isLiquidatable(borrower, loanId);
    }

    // ======== OWNER/ADMIN FUNCTIONS ========

    /**
     * @dev Create a new liquidity pool for a token
     * @param tokenAddress Address of the token
     * @param name Name of the LST token
     * @param symbol Symbol of the LST token
     * @return lstTokenAddress Address of the created LST token
     * @return poolAddress Address of the created liquidity pool
     */
    function createNewPool(
        address tokenAddress,
        string memory name,
        string memory symbol
    ) external onlyOwner returns (address lstTokenAddress, address poolAddress) {
        require(tokenAddress != address(0), "SaigonFacade: Invalid token address");
        
        // Check if a pool already exists for this token
        address existingPool = getPoolForToken(tokenAddress);
        require(existingPool == address(0), "SaigonFacade: Pool already exists for this token");
        
        // Create a new LST token and pool
        (lstTokenAddress, poolAddress) = lstFactory.createLSTPair(name, symbol, tokenAddress);
        
        // Register the pool with the lending protocol
        lendingProtocol.registerPool(tokenAddress, poolAddress);
        
        emit PoolAdded(tokenAddress, lstTokenAddress, poolAddress);
        return (lstTokenAddress, poolAddress);
    }

    /**
     * @dev Set price for a token in the lending protocol
     * @param token Address of the token
     * @param price Price in USD (18 decimals)
     */
    function setTokenPrice(address token, uint256 price) external onlyOwner {
        lendingProtocol.updateTokenPrice(token, price);
    }

    /**
     * @dev Liquidate a loan that is eligible for liquidation
     * @param borrower Address of the borrower
     * @param loanId ID of the loan
     */
    function liquidateLoan(address borrower, uint256 loanId) external onlyOwner {
        require(lendingProtocol.isLiquidatable(borrower, loanId), "SaigonFacade: Loan not liquidatable");
        
        // Get loan details to prepare for liquidation
        (
            ,
            ,
            ,
            address borrowToken,
            uint256 borrowAmount,
            ,
            ,
            ,
            bool active
        ) = lendingProtocol.getLoan(borrower, loanId);
        
        require(active, "SaigonFacade: Loan not active");
        
        // Transfer tokens for repayment (owner must have these tokens)
        IERC20(borrowToken).safeTransferFrom(msg.sender, address(this), borrowAmount);
        IERC20(borrowToken).approve(address(lendingProtocol), borrowAmount);
        
        // Liquidate the loan
        lendingProtocol.liquidate(borrower, loanId);
    }

    /**
     * @dev Transfer ownership of core contracts to a new owner
     * @param newOwner Address of the new owner
     */
    function transferProtocolOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SaigonFacade: Invalid owner address");
        
        lendingProtocol.transferOwnership(newOwner);
        
        // Transfer ownership of all deployed pools
        uint256 poolCount = lstFactory.getDeployedLiquidityPoolCount();
        for (uint256 i = 0; i < poolCount; i++) {
            address poolAddress = lstFactory.deployedLiquidityPools(i);
            SGLP(poolAddress).transferOwnership(newOwner);
        }
        
        // Finally, transfer ownership of the factory
        lstFactory.transferOwnership(newOwner);
    }
}