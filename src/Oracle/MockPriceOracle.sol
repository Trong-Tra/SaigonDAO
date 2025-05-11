// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title MockPriceOracle
 * @dev A simple price oracle implementation for MVP purposes
 * Only supports VNST and vBTC with fixed price (1 vBTC = 2,600,000,000 VNST)
 * Both tokens have 18 decimal places
 */
contract MockPriceOracle is Ownable {
    uint256 public constant VBTC_PRICE_IN_VNST = 2_600_000_000;
    
    // Decimal precision for both tokens (18 decimals)
    uint256 public constant DECIMALS = 18;
    
    // Token addresses
    address public vnstToken;
    address public vbtcToken;
    
    // Events
    event TokenAddressesSet(address indexed vnst, address indexed vbtc);

    constructor(address _vnstToken, address _vbtcToken ) Ownable(msg.sender) {
        require(_vnstToken != address(0) && _vbtcToken != address(0), "MockPriceOracle: zero address");
        vnstToken = _vnstToken;
        vbtcToken = _vbtcToken;
        
        emit TokenAddressesSet(_vnstToken, _vbtcToken);
    }
    
    /**
     * @dev Get the price of one token in terms of another
     * @param baseToken The base token address (e.g., vBTC)
     * @param quoteToken The quote token address (e.g., VNST)
     * @return price The price of baseToken in terms of quoteToken
     */
    function getPrice(address baseToken, address quoteToken) external view returns (uint256) {
        require(vnstToken != address(0) && vbtcToken != address(0), "MockPriceOracle: tokens not set");
        
        // If getting vBTC price in VNST
        if (baseToken == vbtcToken && quoteToken == vnstToken) {
            return VBTC_PRICE_IN_VNST;
        }
        // If getting VNST price in vBTC
        else if (baseToken == vnstToken && quoteToken == vbtcToken) {
            // Return the inverse price (1 / VBTC_PRICE_IN_VNST) with sufficient precision
            // Use 10^18 as a scaling factor to avoid precision loss
            return (10**18) / VBTC_PRICE_IN_VNST;
        }
        
        revert("MockPriceOracle: unsupported token pair");
    }
    
    /**
     * @dev Convert an amount of tokens from one denomination to another
     * @param fromToken The token to convert from
     * @param toToken The token to convert to
     * @param amount The amount to convert 
     * @return The converted amount 
     */
    function convertAmount(address fromToken, address toToken, uint256 amount) external view returns (uint256) {
        require(vnstToken != address(0) && vbtcToken != address(0), "MockPriceOracle: tokens not set");
        
        // If converting from vBTC to VNST
        if (fromToken == vbtcToken && toToken == vnstToken) {
            // 1 vBTC (1e18) = 2,600,000,000 VNST (2.6e9 * 1e18)
            return amount * VBTC_PRICE_IN_VNST;
        }
        // If converting from VNST to vBTC
        else if (fromToken == vnstToken && toToken == vbtcToken) {
            // Need to divide by price while preserving precision
            return (amount * (10**18)) / VBTC_PRICE_IN_VNST;
        }
        
        revert("MockPriceOracle: unsupported token pair");
    }
    
    /**
     * @dev Check if a token pair is supported
     * @param token1 First token address
     * @param token2 Second token address
     * @return true if the pair is supported, false otherwise
     */
    function isPairSupported(address token1, address token2) external view returns (bool) {
        if (vnstToken == address(0) || vbtcToken == address(0)) {
            return false;
        }
        
        return (token1 == vnstToken && token2 == vbtcToken) || 
               (token1 == vbtcToken && token2 == vnstToken);
    }
}