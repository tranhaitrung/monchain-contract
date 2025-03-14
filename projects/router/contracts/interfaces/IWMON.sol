// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IWMON is IERC20{
    function deposit() external payable;

    function transfer(address to, uint256 value) override external returns (bool);

    function withdraw(uint256) external;
}
