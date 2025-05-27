// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@forge-std/Script.sol";
import "@liquidity/mockToken.sol";
import "@oracle/MockPriceOracle.sol";
import "@liquidity/vBTC_VNST.sol";
import "@saigonlst/SaigonLSTFactory.sol";
import "@saigonlst/SaigonLST.sol";
import "@liquidity/SGLP.sol";
import "@lending/SaigonLending.sol";
import "@src/facadeContract.sol";
import "@interfaces/IMockToken.sol";

contract DeployAll is Script {
    // Token parameters
    string constant vBTC_NAME = "v Bitcoin";
    string constant vBTC_SYMBOL = "vBTC";
    uint256 constant vBTC_INITIAL_SUPPLY = 1_000_000; // 1 million vBTC (decimals added by the contract)
    
    string constant VNST_NAME = "Viet Nam Stable Token";
    string constant VNST_SYMBOL = "VNST";
    uint256 constant VNST_INITIAL_SUPPLY = 2_600_000; // 2.6 million VNST (decimals added by the contract)

    // Deployed contract addresses
    address public vbtcToken;
    address public vnstToken;
    address public oracleAddress;
    address public vaultAddress;
    address public lstFactoryAddress;
    address public vbtcPoolAddress;
    address public vnstPoolAddress;
    address public vbtcLSTAddress;
    address public vnstLSTAddress;
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
            vBTC_INITIAL_SUPPLY
        );
        vbtcToken = address(vBTC);

        // Deploy VNST token 
        MockToken VNST = new MockToken(
            VNST_NAME,
            VNST_SYMBOL,
            VNST_INITIAL_SUPPLY
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
        
        // Create vBTC LST pair
        string memory vbtcLPName = string(abi.encodePacked("Saigon ", vBTC_NAME, " LP"));
        string memory vbtcLPSymbol = string(abi.encodePacked("sg", vBTC_SYMBOL, "LP"));
        
        // Use the factory's createLSTPair function which handles both LST and LP creation
        (address lstToken, address liquidityPool) = factory.createLSTPair(
            vbtcLPName,
            vbtcLPSymbol,
            vbtcToken // The liquidity token that can be deposited in the pool
        );
        
        vbtcLSTAddress = lstToken;
        vbtcPoolAddress = liquidityPool;
        
        // Create VNST LST pair
        string memory vnstLPName = string(abi.encodePacked("Saigon ", VNST_NAME, " LP"));
        string memory vnstLPSymbol = string(abi.encodePacked("sg", VNST_SYMBOL, "LP"));
        
        // Use the factory's createLSTPair function which handles both LST and LP creation
        (lstToken, liquidityPool) = factory.createLSTPair(
            vnstLPName,
            vnstLPSymbol,
            vnstToken // The liquidity token that can be deposited in the pool
        );
        
        vnstLSTAddress = lstToken;
        vnstPoolAddress = liquidityPool;
        
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
        
        // Transfer ownership of SGLP pools to SaigonLending contract
        // This is critical for the lending contract to be able to call lend() function
        // The pools are currently owned by the SaigonLSTFactory
        SaigonLSTFactory factory = SaigonLSTFactory(lstFactoryAddress);
        
        // Use the factory's transferPoolOwnership function to transfer ownership to lending contract
        factory.transferPoolOwnership(vbtcPoolAddress, lendingAddress);
        factory.transferPoolOwnership(vnstPoolAddress, lendingAddress);
        
        console.log("SaigonLending deployed at:", lendingAddress);
        console.log("Transferred ownership of vBTC pool to SaigonLending");
        console.log("Transferred ownership of VNST pool to SaigonLending");
    }
    
    function deployFacade() internal {
        console.log("Deploying Facade Contract...");
        
        // Deploy the facade contract with the 2 required arguments
        // (previously had 8 arguments which was incorrect)
        SaigonFacade facade = new SaigonFacade(
            lstFactoryAddress,
            lendingAddress
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
        console.log("vBTC LST Token: ", vbtcLSTAddress);
        console.log("VNST Liquidity Pool: ", vnstPoolAddress);
        console.log("VNST LST Token: ", vnstLSTAddress);
        console.log("Lending Contract: ", lendingAddress);
        console.log("Facade Contract: ", facadeAddress);
        console.log("===============================");
    }
}