// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../interfaces/IMockToken.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "../Oracle/MockPriceOracle.sol";

contract vBTC_VNST_Vault is Ownable, ReentrancyGuard {
    // Token contracts
    IMockToken public vBTC;
    IMockToken public VNST;
    MockPriceOracle public priceOracle;
    
    // Fee settings (in basis points, 1 = 0.01%)
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public swapFee = 30; // 0.3% default fee
    
    // Events
    event SwapExecuted(
        address indexed user,
        address fromToken,
        address toToken, 
        uint256 amountIn, 
        uint256 amountOut
    );
    event FeeUpdated(uint256 newFee);
    
    /**
     * @dev Constructor initializes the vault with token and oracle addresses
     * @param _vBTC Address of the vBTC token
     * @param _VNST Address of the VNST token
     * @param _oracle Address of the price oracle
     */
    constructor(
        address _vBTC,
        address _VNST,
        address _oracle
    ) Ownable(msg.sender) {
        require(_vBTC != address(0), "vBTC_VNST_Vault: vBTC is zero address");
        require(_VNST != address(0), "vBTC_VNST_Vault: VNST is zero address");
        require(_oracle != address(0), "vBTC_VNST_Vault: Oracle is zero address");
        
        vBTC = IMockToken(_vBTC);
        VNST = IMockToken(_VNST);
        priceOracle = MockPriceOracle(_oracle);
        
        // Ensure the oracle supports our token pair
        require(
            priceOracle.isPairSupported(_vBTC, _VNST),
            "vBTC_VNST_Vault: Token pair not supported by oracle"
        );
    }
    
    /**
     * @dev Swaps tokens using oracle price conversion
     * @param fromToken The token to swap from (must be vBTC or VNST)
     * @param toToken The token to swap to (must be vBTC or VNST)
     * @param amountIn The amount of fromToken to swap
     * @param minAmountOut Minimum amount of toToken to receive (slippage protection)
     * @return amountOut The amount of toToken received
     */
    function swap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        // Validate inputs
        require(amountIn > 0, "vBTC_VNST_Vault: Invalid input amount");
        require(
            (fromToken == address(vBTC) && toToken == address(VNST)) ||
            (fromToken == address(VNST) && toToken == address(vBTC)),
            "vBTC_VNST_Vault: Invalid token pair"
        );
        
        // Calculate output amount using the oracle price with fee applied
        uint256 feeAmount = (amountIn * swapFee) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - feeAmount;
        
        // Get conversion from oracle
        amountOut = priceOracle.convertAmount(fromToken, toToken, amountInAfterFee);
        
        // Slippage check
        require(amountOut >= minAmountOut, "vBTC_VNST_Vault: Slippage too high");
        
        // Transfer tokens
        IMockToken(fromToken).transferFrom(msg.sender, address(this), amountIn);
        IMockToken(toToken).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(msg.sender, fromToken, toToken, amountIn, amountOut);
        return amountOut;
    }
    
    /**
     * @dev Calculates the expected output amount for a swap
     * @param fromToken The token to swap from
     * @param toToken The token to swap to
     * @param amountIn The amount of fromToken to swap
     * @return The expected amount of toToken to receive
     */
    function getExpectedOut(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) external view returns (uint256) {
        // Validate inputs
        require(amountIn > 0, "vBTC_VNST_Vault: Invalid input amount");
        require(
            (fromToken == address(vBTC) && toToken == address(VNST)) ||
            (fromToken == address(VNST) && toToken == address(vBTC)),
            "vBTC_VNST_Vault: Invalid token pair"
        );
        
        // Calculate fee
        uint256 feeAmount = (amountIn * swapFee) / FEE_DENOMINATOR;
        uint256 amountInAfterFee = amountIn - feeAmount;
        
        // Get conversion from oracle
        return priceOracle.convertAmount(fromToken, toToken, amountInAfterFee);
    }
    
    /**
     * @dev Updates the swap fee
     * @param newFee New fee in basis points (1 = 0.01%)
     */
    function setSwapFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "vBTC_VNST_Vault: Fee too high"); // Max fee 10%
        swapFee = newFee;
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Allows the owner to withdraw any tokens in the vault
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IMockToken(token).transfer(owner(), amount);
    }
}