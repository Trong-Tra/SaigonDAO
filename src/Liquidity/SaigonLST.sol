// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract LST is ERC20, Ownable {
    address public liquidityPool;

    /**
     * @dev Modifier to restrict functions to be called only by the liquidity pool
     */
    modifier onlyLiquidityPool() {
        require(msg.sender == liquidityPool, "LST: caller is not the liquidity pool");
        _;
    }

    /**
     * @dev Constructor sets the name and symbol of the token and initializes the owner
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     */
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {}

    /**
     * @dev Sets the liquidity pool address, only deployer can call this function
     * @param _liquidityPool Address of the liquidity pool contract
     */
    function setLiquidityPool(address _liquidityPool) external onlyOwner {
        require(_liquidityPool != address(0), "LST: zero address");
        liquidityPool = _liquidityPool;
    }

    function mint(address liquidityProvider, uint256 amount) external onlyLiquidityPool {
        _mint(liquidityProvider, amount);
    }

    function burn(address liquidityProvider, uint256 amount) external onlyLiquidityPool {
        _burn(liquidityProvider, amount);
    }
}