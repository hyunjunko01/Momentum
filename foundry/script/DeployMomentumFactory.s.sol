// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {MomentumFactory} from "../src/MomentumFactory.sol";

contract DeployMomentumFactory is Script {
    function run() external returns (MomentumFactory) {
        vm.startBroadcast();
        MomentumFactory momentumFactory = new MomentumFactory();
        vm.stopBroadcast();
        return momentumFactory;
    }
}
