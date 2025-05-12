// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title MockToken
 * @dev This contract is a mock ERC20 token for testing purposes.
 */
contract MockToken is ERC20, Ownable {
    uint8 private decimals;

    /**
     * @dev Constructor that gives the msg.sender all of the initial supply.
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial token supply
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
    ) ERC20(name, symbol) Ownable(msg.sender) {
        decimals = 18; //default to 18 decimals for convinience
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
}

