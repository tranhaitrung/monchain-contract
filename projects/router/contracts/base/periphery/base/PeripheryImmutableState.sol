// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import '../interfaces/IPeripheryImmutableState.sol';

/// @title Immutable state
/// @notice Immutable state used by periphery contracts
abstract contract PeripheryImmutableState is IPeripheryImmutableState {
    /// @inheritdoc IPeripheryImmutableState
    address public immutable override deployer;
    /// @inheritdoc IPeripheryImmutableState
    address public immutable override factory;
    /// @inheritdoc IPeripheryImmutableState
    address public immutable override WMON;

    constructor(address _deployer, address _factory, address _WMON) {
        deployer = _deployer;
        factory = _factory;
        WMON = _WMON;
    }
}
