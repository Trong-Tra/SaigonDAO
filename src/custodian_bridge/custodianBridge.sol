// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@interfaces/IMockToken.sol";

/**
 * @dev We assume the price oracle interface since if we actually mock this or implement it, we need to have liquidity for all sort token that it support 
 */
interface IPriceOracle 
{
    function getPrice(address baseToken, address quoteToken) external view returns (uint256);
    function convertAmount(address fromToken, address toToken, uint256 amount) external view returns (uint256);
    function isPairSupported(address token1, address token2) external view returns (bool);
}

contract vBTCCustodianBridge is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // The vBTC token contract
    IMockToken public vBTC;
    
    // Price oracle interface
    IPriceOracle public priceOracle;
    
    // Supported tokens for minting vBTC
    mapping(address => bool) public supportedTokens;
    
    // Token symbols for better UI display
    mapping(address => string) public tokenSymbols;
    
    // BTC reserve tracking
    uint256 public totalBTCLocked;
    
    // Fee parameters (in basis points, 100 = 1%)
    uint256 public mintFee = 50; // Default 0.5% fee
    uint256 public constant MAX_FEE = 500; // Max fee 5%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event TokenOnboarded(address indexed token, string symbol);
    event TokenRemoved(address indexed token);
    event DirectMint(address indexed to, uint256 amount);
    event CrossTokenMint(address indexed from, address indexed token, uint256 inputAmount, uint256 vbtcAmount);
    event FeeUpdated(uint256 newFee);
    event PriceOracleUpdated(address indexed newOracle);
    
    /**
     * @dev Constructor
     * @param _vBTC Address of the vBTC token
     * @param _priceOracle Address of the price oracle
     */
    constructor(address _vBTC, address _priceOracle) Ownable(msg.sender) {
        require(_vBTC != address(0), "vBTCCustodianBridge: vBTC is zero address");
        require(_priceOracle != address(0), "vBTCCustodianBridge: Oracle is zero address");
        
        vBTC = IMockToken(_vBTC);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    /**
     * @dev Mints vBTC tokens to a specific address
     * @notice Only callable by owner/deployer (custodian)
     * @param to Address to receive the minted vBTC
     * @param amount Amount of vBTC to mint (in vBTC's smallest units)
     */
    function moveTokenOnchain(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "vBTCCustodianBridge: Cannot mint to zero address");
        require(amount > 0, "vBTCCustodianBridge: Amount must be greater than zero");
        
        // Mint vBTC tokens to the specified address
        vBTC.mint(to, amount);
        
        emit DirectMint(to, amount);
    }
    
    /**
     * @dev Add a new token that can be used to mint vBTC
     * @param token Address of the token to support
     * @param symbol Symbol of the token for display purposes
     */
    function addSupportedToken(address token, string calldata symbol) external onlyOwner {
        require(token != address(0), "vBTCCustodianBridge: Cannot add zero address token");
        require(bytes(symbol).length > 0, "vBTCCustodianBridge: Symbol cannot be empty");
        require(!supportedTokens[token], "vBTCCustodianBridge: Token already supported");
        
        // Check if the price oracle supports this token pair
        require(
            priceOracle.isPairSupported(token, address(vBTC)),
            "vBTCCustodianBridge: Oracle doesn't support this token pair"
        );
        
        supportedTokens[token] = true;
        tokenSymbols[token] = symbol;
        
        emit TokenOnboarded(token, symbol);
    }
    
    /**
     * @dev Remove a supported token
     * @param token Address of the token to remove
     */
    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "vBTCCustodianBridge: Token not supported");
        
        supportedTokens[token] = false;
        delete tokenSymbols[token];
        
        emit TokenRemoved(token);
    }
    
    /**
     * @dev Update the mint fee
     * @param newFee New fee in basis points
     */
    function updateMintFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "vBTCCustodianBridge: Fee exceeds maximum");
        
        mintFee = newFee;
        
        emit FeeUpdated(newFee);
    }
    
    /**
     * @dev Update the price oracle
     * @param newOracle Address of the new price oracle
     */
    function updatePriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "vBTCCustodianBridge: Oracle is zero address");
        
        priceOracle = IPriceOracle(newOracle);
        
        emit PriceOracleUpdated(newOracle);
    }
    
    /**
     * @dev Get the amount of vBTC that would be minted for a given input token and amount
     * @param token Address of the input token
     * @param amount Amount of input token
     * @return vbtcAmount Amount of vBTC that would be minted
     */
    function getExpectedVBTCAmount(address token, uint256 amount) external view returns (uint256) {
        require(supportedTokens[token], "vBTCCustodianBridge: Token not supported");
        require(amount > 0, "vBTCCustodianBridge: Amount must be greater than zero");
        
        // Convert token to vBTC equivalent using the oracle
        uint256 vbtcEquivalent = priceOracle.convertAmount(token, address(vBTC), amount);
        
        // Apply the mint fee
        uint256 feeAmount = (vbtcEquivalent * mintFee) / BASIS_POINTS;
        
        return vbtcEquivalent - feeAmount;
    }
    
    /**
     * @dev Mint vBTC using another supported token
     * @param token Address of the token to use for minting vBTC
     * @param amount Amount of the token to use
     */
    function mintWithToken(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "vBTCCustodianBridge: Token not supported");
        require(amount > 0, "vBTCCustodianBridge: Amount must be greater than zero");
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Convert token to vBTC equivalent using the oracle
        uint256 vbtcEquivalent = priceOracle.convertAmount(token, address(vBTC), amount);
        
        // Apply the mint fee
        uint256 feeAmount = (vbtcEquivalent * mintFee) / BASIS_POINTS;
        uint256 vbtcToMint = vbtcEquivalent - feeAmount;
        
        // Update BTC locked (for accounting purposes)
        totalBTCLocked += vbtcToMint;
        
        // Mint vBTC tokens to the user
        vBTC.mint(msg.sender, vbtcToMint);
        
        emit CrossTokenMint(msg.sender, token, amount, vbtcToMint);
    }
    
    /**
     * @dev Withdraw tokens mistakenly sent to the contract
     * @param token Address of the token to withdraw
     * @param to Address to receive the tokens
     */
    function withdrawToken(address token, address to) external onlyOwner {
        require(to != address(0), "vBTCCustodianBridge: Cannot withdraw to zero address");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "vBTCCustodianBridge: No tokens to withdraw");
        
        IERC20(token).safeTransfer(to, balance);
    }
    
    /**
     * @dev Get supported tokens count
     * @return count Number of supported tokens
     */
    function getSupportedTokensCount() external view returns (uint256) {
        uint256 count = 0;
        address[] memory addedTokens = new address[](100); // Assume no more than 100 tokens
        
        for (uint256 i = 0; i < addedTokens.length; i++) {
            if (supportedTokens[addedTokens[i]]) {
                count++;
            }
        }
        
        return count;
    }
}