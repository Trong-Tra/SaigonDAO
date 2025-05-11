// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../SaigonLST/SaigonLST.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SGLP is Ownable {
    using SafeERC20 for IERC20;
    SaigonLST public lstToken;
    address public liquidityToken; // Address of the liquidity token (VNST, vBTC, etc.)
    
    // Exchange rate between native token and LST (1 ETH = X LST)
    // Set to 1:1 initially, this will increase as profit being made with lending and isolated margin trading protocols
    uint256 public exchangeRate = 1 ether; // 18 decimals as default
    
    // Total liquidity in the pool
    uint256 public poolLiquidityVolume;
    uint256 public lstVolume;
    uint256 public lentLiquidityVolume = 0;

    mapping(address => uint256) public borrowers;
    
    // Events
    event ProvideLiquidity(address indexed user, uint256 nativeAmount, uint256 lstAmount);
    event Unstake(address indexed user, uint256 lstAmount, uint256 nativeAmount);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);

    /**
     * @dev Constructor sets up the LST token
     * @param lstTokenAddress The address of the LST token
     * @param liquidityTokenAddress The address of the liquidity token (VNST, vBTC, etc.)
     */
    constructor(address lstTokenAddress, address liquidityTokenAddress) Ownable(msg.sender) {
        require(lstTokenAddress != address(0), "LiquidityPool: zero address");
        lstToken = SaigonLST(lstTokenAddress);
        liquidityToken = liquidityTokenAddress;
    }

    /**
     * @dev Deposit tokens and receive LST tokens
     * @param liquidityAmount The amount of the liquidity token (VNST, vBTC, etc.)
     */
    function provideLiquidity(uint256 liquidityAmount) external payable {
        require(liquidityAmount > 0, "LiquidityPool: deposit amount must be greater than 0");
        
        uint256 lstAmount = (liquidityAmount * 1 ether) / exchangeRate;
        
        // Transfer the original token from the user to the contract
        IERC20(liquidityToken).safeTransferFrom(msg.sender, address(this), liquidityAmount);
        poolLiquidityVolume += liquidityAmount;
        
        // Mint LST tokens to the user
        lstToken.mint(msg.sender, lstAmount);
        lstVolume += lstAmount;

        // Update the exchange rate
        _updateExchangeRate();
        
        emit ProvideLiquidity(msg.sender, liquidityAmount, lstAmount);
    }

    /**
     * @dev Withdraw native tokens by burning LST tokens
     * @param lstAmount The amount of LST tokens to burn
     */
    function unstake(uint256 lstAmount) external {
        require(lstAmount > 0, "LiquidityPool: withdraw amount must be greater than 0");
        require(IERC20(lstToken).balanceOf(msg.sender) >= lstAmount, "LiquidityPool: insufficient LST balance");
        
        uint256 liquidityAmount = (lstAmount * exchangeRate) / 1 ether;
        require(IERC20(liquidityToken).balanceOf(address(this)) >= liquidityAmount, "LiquidityPool: insufficient liquidity");
        
        // Burn the LST tokens
        lstToken.burn(msg.sender, lstAmount);
        lstVolume -= lstAmount;
        
        // Transfer the liquidity token back to the user
        IERC20(liquidityToken).safeTransfer(msg.sender, liquidityAmount);
        poolLiquidityVolume -= liquidityAmount;

        // Update the exchange rate
        _updateExchangeRate();
        
        emit Unstake(msg.sender, lstAmount, liquidityAmount);
    }

    function lend(address borrower, uint256 amount) external onlyOwner {
        require(amount > 0, "LiquidityPool: lend amount must be greater than 0");
        uint256 availableLiquidityForLending = (poolLiquidityVolume * 50/100) - lentLiquidityVolume;
        require(availableLiquidityForLending >= amount, "LiquidityPool: insufficient liquidity");
        
        lentLiquidityVolume += amount;
        
        // Transfer the liquidity token to the borrower
        IERC20(liquidityToken).safeTransfer(borrower, amount);

        borrowers[borrower] += amount;
    }

    function repay(address borrower, uint256 amount) external onlyOwner {
        require(amount > 0, "LiquidityPool: repay amount must be greater than 0");
        require(borrowers[borrower] >= amount, "LiquidityPool: insufficient borrowed amount");
        require(lentLiquidityVolume >= amount, "LiquidityPool: insufficient lent liquidity");
        
        // Transfer the liquidity token back to the pool
        IERC20(liquidityToken).safeTransferFrom(borrower, address(this), amount);
        lentLiquidityVolume -= amount;

        poolLiquidityVolume += amount - borrowers[borrower];
        borrowers[borrower] = 0;
    }

    function _updateExchangeRate() internal {
        uint256 oldRate = exchangeRate;
        exchangeRate = (poolLiquidityVolume * 1 ether) / lstVolume;
        emit ExchangeRateUpdated(oldRate, exchangeRate);
    }

    function getExchangeRate() external view returns (uint256) {
        return exchangeRate;
    }
    function getPoolLiquidityVolume() external view returns (uint256) {
        return poolLiquidityVolume;
    }
    function getLSTVolume() external view returns (uint256) {
        return lstVolume;
    }
}