// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SaigonLST.sol";
import "../Liquidity/SGLP.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract LSTFactory is Ownable {
    // Arrays to keep track of deployed contracts
    address[] public deployedLSTTokens;
    address[] public deployedLiquidityPools;
    
    // Mapping from LST token to liquidity pool
    mapping(address => address) public lstToLiquidityPool;
    
    // Events
    event LSTPairCreated(address indexed lstToken, address indexed liquidityPool, string name, string symbol);
    
    /**
     * @dev Constructor initializes ownership
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new LST token and associated liquidity pool
     * @param name The name of the LST token
     * @param symbol The symbol of the LST token
     * @return lst Address of the deployed LST token
     * @return pool Address of the deployed liquidity pool
     */
    function createLSTPair(string memory name, string memory symbol, address liquidityToken) external returns (address lst, address pool) {
        // Deploy new LST token
        SaigonLST lstToken = new SaigonLST(name, symbol);
        
        // Deploy new liquidity pool
        SGLP liquidityPool = new SGLP(address(lstToken), liquidityToken);
        
        // Set the liquidity pool address in the LST contract
        lstToken.setLiquidityPool(address(liquidityPool));
        
        // Store deployed contracts
        deployedLSTTokens.push(address(lstToken));
        deployedLiquidityPools.push(address(liquidityPool));
        lstToLiquidityPool[address(lstToken)] = address(liquidityPool);
        
        emit LSTPairCreated(address(lstToken), address(liquidityPool), name, symbol);
        
        return (address(lstToken), address(liquidityPool));
    }
    
    /**
     * @dev Get the number of deployed LST tokens
     * @return Number of deployed LST tokens
     */
    function getDeployedLSTCount() external view returns (uint256) {
        return deployedLSTTokens.length;
    }
    
    /**
     * @dev Get the liquidity pool associated with an LST token
     * @param lstToken Address of the LST token
     * @return Address of the associated liquidity pool
     */
    function getLiquidityPool(address lstToken) external view returns (address) {
        return lstToLiquidityPool[lstToken];
    }

    function getDeployedLiquidityPoolCount() external view returns (uint256) {
        return deployedLiquidityPools.length;
    }

    function getDeployedLiquidityPools() external view returns (address[] memory) {
        return deployedLiquidityPools;
    }
}