// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title Immutable state
/// @notice Functions that return immutable state of the router
interface IPeripheryImmutableState {
    /// @return Returns the address of the MonSwap deployer
    function deployer() external view returns (address);

    /// @return Returns the address of the MonSwap factory
    function factory() external view returns (address);

    /// @return Returns the address of WMON9
    function WMON() external view returns (address);
}
