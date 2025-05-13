// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IMockToken
 * @dev Interface for the MockToken contract with additional mint function
 */
interface IMockToken is IERC20 {
    function mint(address account, uint256 amount) external;
    function decimals() external view returns (uint8);
}