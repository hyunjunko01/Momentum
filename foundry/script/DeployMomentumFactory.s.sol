// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {MomentumFactory} from "../src/MomentumFactory.sol";

contract DeployMomentumFactory is Script {
    function run() external returns (MomentumFactory) {
        if (block.chainid == 11155111) {
            // 1. Load the private key from your .env file
            uint256 deployerPrivateKey = vm.envUint("SEPOLIA_PRIVATE_KEY");

            // 2. Pass that private key to startBroadcast
            // This tells Foundry to use YOUR wallet as the --sender
            vm.startBroadcast(deployerPrivateKey);

            // 3. Deploy the contract
            MomentumFactory momentumFactory = new MomentumFactory();

            // 4. Stop the broadcast
            vm.stopBroadcast();

            return momentumFactory;
        } else {
            vm.startBroadcast();
            MomentumFactory momentumFactory = new MomentumFactory();
            vm.stopBroadcast();
            return momentumFactory;
        }
    }
}
