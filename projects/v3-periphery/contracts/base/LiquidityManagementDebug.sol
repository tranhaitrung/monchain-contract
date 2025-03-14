// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '../core/contracts/interfaces/IMonFactory.sol';
import '../core/contracts/interfaces/callback/IMonMintCallback.sol';
import '../core/contracts/libraries/TickMath.sol';

import '../libraries/PoolAddress.sol';
import '../libraries/CallbackValidation.sol';
import '../libraries/LiquidityAmounts.sol';

import './PeripheryPayments.sol';
import './PeripheryImmutableState.sol';

/// @title Liquidity management functions
/// @notice Internal functions for safely managing liquidity in MonSwap V3
abstract contract LiquidityManagement is IMonMintCallback, PeripheryImmutableState, PeripheryPayments {

    event AddLiquidity(AddLiquidityParams params);
    event MintCallBack(MintCallbackData data);
    struct MintCallbackData {
        PoolAddress.PoolKey poolKey;
        address payer;
    }

    event StepStop(uint104 stepStop);
    event Pool(IMonPool pool);
    event MintDone(uint256 amount0, uint256 amount1);
    event GetLiquidity(uint128 liquidity);

    /// @inheritdoc IMonMintCallback
    function monMintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external override {
        MintCallbackData memory decoded = abi.decode(data, (MintCallbackData));
        emit MintCallBack(decoded);
        CallbackValidation.verifyCallback(deployer, decoded.poolKey);

        if (amount0Owed > 0) pay(decoded.poolKey.token0, decoded.payer, msg.sender, amount0Owed);
        if (amount1Owed > 0) pay(decoded.poolKey.token1, decoded.payer, msg.sender, amount1Owed);
    }

    struct AddLiquidityParams {
        address token0;
        address token1;
        uint24 fee;
        address recipient;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
    }

    /// @notice Add liquidity to an initialized pool
    function addLiquidity(AddLiquidityParams memory params, uint104 stepStop)
        public
        returns (
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1,
            IMonPool pool
        )
    {
        emit AddLiquidity(params);
        PoolAddress.PoolKey memory poolKey =
            PoolAddress.PoolKey({token0: params.token0, token1: params.token1, fee: params.fee});
        
        pool = IMonPool(PoolAddress.computeAddress(deployer, poolKey));
        emit Pool(pool);
        if (stepStop == 1) return (0, 0, 0, pool);

        // compute the liquidity amount
        {
            (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
            uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(params.tickLower);
            uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(params.tickUpper);
            if (stepStop == 2) return (0, 0, 0, pool);

            liquidity = LiquidityAmounts.getLiquidityForAmounts(
                sqrtPriceX96,
                sqrtRatioAX96,
                sqrtRatioBX96,
                params.amount0Desired,
                params.amount1Desired
            );
            emit GetLiquidity(liquidity);
            if (stepStop == 3) return (liquidity, 0, 0, pool);
        }

        (amount0, amount1) = pool.mint(
            params.recipient,
            params.tickLower,
            params.tickUpper,
            liquidity,
            abi.encode(MintCallbackData({poolKey: poolKey, payer: msg.sender}))
        );
        emit MintDone(amount0, amount1);
        require(amount0 >= params.amount0Min && amount1 >= params.amount1Min, 'Price slippage check');
    }
}
