// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Liquidity/mockToken.sol";
import "../src/Oracle/MockPriceOracle.sol";
import "../src/Liquidity/vBTC_VNST.sol";
import "../src/SaigonLST/SaigonLSTFactory.sol";
import "../src/SaigonLST/SaigonLST.sol";
import "../src/Liquidity/SGLP.sol";
import "../src/Lending/SaigonLending.sol";
import "../src/facadeContract.sol";
import "../src/interfaces/IMockToken.sol";

/**
 * @title DeployAll
 * @dev Master script to deploy the entire SaigonDAO ecosystem in the correct order
 */
contract DeployAll is Script {
    // Token parameters
    string constant vBTC_NAME = "v Bitcoin";
    string constant vBTC_SYMBOL = "vBTC";
    uint256 constant vBTC_INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million vBTC
    
    string constant VNST_NAME = "Viet Nam Stable Token";
    string constant VNST_SYMBOL = "VNST";
    uint256 constant VNST_INITIAL_SUPPLY = 2_600_000 * 10**18; // 2.6 million VNST

    uint8 constant DECIMALS = 18;

    // Deployed contract addresses
    address public vbtcToken;
    address public vnstToken;
    address public oracleAddress;
    address public vaultAddress;
    address public lstFactoryAddress;
    address public vbtcPoolAddress;
    address public vnstPoolAddress;
    address public lendingAddress;
    address public facadeAddress;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_DEV_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy Tokens
        deployTokens();
        
        // Step 2: Deploy Oracle
        deployOracle();
        
        // Step 3: Deploy Vault
        deployVault();
        
        // Step 4: Deploy LST Factory
        deployLSTFactory();
        
        // Step 5: Deploy Liquidity Pools
        deployLiquidityPools();
        
        // Step 6: Deploy Lending
        deployLending();
        
        // Step 7: Deploy Facade
        deployFacade();
        
        // Log all deployed addresses
        logDeployedAddresses();

        vm.stopBroadcast();
    }
    
    function deployTokens() internal {
        console.log("Deploying Tokens...");
        
        // Deploy vBTC token
        MockToken vBTC = new MockToken(
            vBTC_NAME,
            vBTC_SYMBOL,
            vBTC_INITIAL_SUPPLY,
            DECIMALS
        );
        vbtcToken = address(vBTC);

        // Deploy VNST token
        MockToken VNST = new MockToken(
            VNST_NAME,
            VNST_SYMBOL,
            VNST_INITIAL_SUPPLY,
            DECIMALS
        );
        vnstToken = address(VNST);
        
        console.log("v Bitcoin Token deployed at:", vbtcToken);
        console.log("Viet Nam Stable Token deployed at:", vnstToken);
    }
    
    function deployOracle() internal {
        console.log("Deploying Oracle...");
        
        // Deploy the price oracle
        MockPriceOracle oracle = new MockPriceOracle(vnstToken, vbtcToken);
        oracleAddress = address(oracle);
        
        console.log("MockPriceOracle deployed at:", oracleAddress);
    }
    
    function deployVault() internal {
        console.log("Deploying vBTC_VNST Vault...");
        
        // Deploy the vault
        vBTC_VNST_Vault vault = new vBTC_VNST_Vault(
            vbtcToken,
            vnstToken,
            oracleAddress
        );
        vaultAddress = address(vault);
        
        console.log("vBTC_VNST_Vault deployed at:", vaultAddress);
    }
    
    function deployLSTFactory() internal {
        console.log("Deploying LST Factory...");
        
        // Deploy the Saigon LST Factory
        SaigonLSTFactory factory = new SaigonLSTFactory();
        lstFactoryAddress = address(factory);
        
        console.log("SaigonLSTFactory deployed at:", lstFactoryAddress);
    }
    
    function deployLiquidityPools() internal {
        console.log("Deploying Liquidity Pools...");
        
        SaigonLSTFactory factory = SaigonLSTFactory(lstFactoryAddress);
        
        // Deploy vBTC Liquidity Pool
        string memory vbtcLPName = string(abi.encodePacked("Saigon ", vBTC_NAME, " LP"));
        string memory vbtcLPSymbol = string(abi.encodePacked("sg", vBTC_SYMBOL, "LP"));
        
        address vbtcLSTAddress = factory.createLST(vbtcLPName, vbtcLPSymbol, 18);
        SGLP vbtcPool = new SGLP(vbtcToken, vbtcLSTAddress);
        vbtcPoolAddress = address(vbtcPool);
        
        // Initialize vBTC LST
        SaigonLST vbtcLST = SaigonLST(vbtcLSTAddress);
        vbtcLST.initialize(vbtcPoolAddress);
        
        // Deploy VNST Liquidity Pool
        string memory vnstLPName = string(abi.encodePacked("Saigon ", VNST_NAME, " LP"));
        string memory vnstLPSymbol = string(abi.encodePacked("sg", VNST_SYMBOL, "LP"));
        
        address vnstLSTAddress = factory.createLST(vnstLPName, vnstLPSymbol, 18);
        SGLP vnstPool = new SGLP(vnstToken, vnstLSTAddress);
        vnstPoolAddress = address(vnstPool);
        
        // Initialize VNST LST
        SaigonLST vnstLST = SaigonLST(vnstLSTAddress);
        vnstLST.initialize(vnstPoolAddress);
        
        console.log("vBTC Liquidity Pool deployed at:", vbtcPoolAddress);
        console.log("vBTC LST Token deployed at:", vbtcLSTAddress);
        console.log("VNST Liquidity Pool deployed at:", vnstPoolAddress);
        console.log("VNST LST Token deployed at:", vnstLSTAddress);
    }
    
    function deployLending() internal {
        console.log("Deploying Lending Contract...");
        
        // Deploy SaigonLending contract
        SaigonLending lendingContract = new SaigonLending();
        lendingAddress = address(lendingContract);
        
        // Register liquidity pools
        lendingContract.registerPool(vbtcToken, vbtcPoolAddress);
        lendingContract.registerPool(vnstToken, vnstPoolAddress);
        
        // Register swap vault for token pairs
        lendingContract.registerSwapVault(vbtcToken, vnstToken, vaultAddress);
        
        // Set initial token prices (1 vBTC = 26000 USD, 1 VNST = 1 USD)
        lendingContract.updateTokenPrice(vbtcToken, 26_000 * 10**18);
        lendingContract.updateTokenPrice(vnstToken, 1 * 10**18);
        
        console.log("SaigonLending deployed at:", lendingAddress);
    }
    
    function deployFacade() internal {
        console.log("Deploying Facade Contract...");
        
        // Deploy the facade contract
        SaigonFacade facade = new SaigonFacade(
            vbtcToken,
            vnstToken,
            vaultAddress,
            oracleAddress,
            lendingAddress,
            lstFactoryAddress,
            vbtcPoolAddress,
            vnstPoolAddress
        );
        facadeAddress = address(facade);
        
        console.log("SaigonFacade deployed at:", facadeAddress);
    }
    
    function logDeployedAddresses() internal view {
        console.log("\n=== SaigonDAO Deployment Summary ===");
        console.log("v Bitcoin Token: ", vbtcToken);
        console.log("Viet Nam Stable Token: ", vnstToken);
        console.log("Price Oracle: ", oracleAddress);
        console.log("vBTC_VNST Vault: ", vaultAddress);
        console.log("LST Factory: ", lstFactoryAddress);
        console.log("vBTC Liquidity Pool: ", vbtcPoolAddress);
        console.log("VNST Liquidity Pool: ", vnstPoolAddress);
        console.log("Lending Contract: ", lendingAddress);
        console.log("Facade Contract: ", facadeAddress);
        console.log("===============================");
    }
}