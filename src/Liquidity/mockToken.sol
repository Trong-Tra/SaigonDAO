// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockToken
 * @dev This contract is a mock ERC20 token for testing purposes.
 */
contract MockToken is ERC20 {
    /**
     * @dev Constructor that gives the msg.sender all of the initial supply.
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param _initialSupply The initial supply of the token
     */
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 _initialSupply
    ) 
    ERC20(name, symbol) 
    {
        _mint(msg.sender, _initialSupply * (10 ** decimals()));
	}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18; // default to 18 decimals for convenience
    }
}

