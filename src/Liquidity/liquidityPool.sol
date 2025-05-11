// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SaigonLST.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LiquidityPool
 * @dev A basic liquidity pool that mints LST tokens when users deposit native tokens
 * and burns LST tokens when users withdraw native tokens.
 */
contract LiquidityPool is Ownable {
    using SafeERC20 for IERC20;
    SaigonLST public lstToken;
    address public liquidityToken; // Address of the liquidity token (VNST, vBTC, etc.)
    
    // Exchange rate between native token and LST (1 ETH = X LST)
    // Set to 1:1 initially, this will increase as profit being made with lending and isolated margin trading protocols
    uint256 public exchangeRate = 1 ether; // 18 decimals as default
    
    // Total liquidity in the pool
    uint256 public poolLiquiditVolume;
    uint256 public lstVolume;
    
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
        poolLiquiditVolume += liquidityAmount;
        
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
        require(lstToken.balanceOf(msg.sender) >= lstAmount, "LiquidityPool: insufficient LST balance");
        
        uint256 liquidityAmount = (lstAmount * exchangeRate) / 1 ether;
        require(liquidityToken.balanceOf(address(this)) >= liquidityAmount, "LiquidityPool: insufficient liquidity");
        
        // Burn the LST tokens
        lstToken.burn(msg.sender, lstAmount);
        lstVolume -= lstAmount;
        
        // Transfer the liquidity token back to the user
        IERC20(liquidityToken).safeTransfer(msg.sender, liquidityAmount);
        poolLiquiditVolume -= nativeAmount;

        // Updarere the exchange rate
        _updateExchangeRate();
        
        emit Unstake(msg.sender, lstAmount, nativeAmount);
    }

    /**
     * @dev Update the exchange rate (only owner)
     * @param newRate The new exchange rate
     */
    function _updateExchangeRate() internal {
        uint256 oldRate = exchangeRate;
        exchangeRate = (poolLiquiditVolume * 1 ether) / lstVolume;
        emit ExchangeRateUpdated(oldRate, exchangeRate);
    }

    function getExchangeRate() external view returns (uint256) {
        return exchangeRate;
    }
    function getPoolLiquidityVolume() external view returns (uint256) {
        return poolLiquiditVolume;
    }
    function getLSTVolume() external view returns (uint256) {
        return lstVolume;
    }
}