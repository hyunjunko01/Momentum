// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// We must import the Campaign contract so this factory knows what it's creating.
import {Campaign} from "./Campaign.sol";

/**
 * @title MomentumFactory
 * @author Tyler Ko
 * @notice A factory contract to deploy and manage all research campaigns on the Momentum platform.
 */
contract MomentumFactory {
    // --- State Variables ---

    // An array that stores the address of every Campaign contract ever created.
    address[] public s_deployedCampaigns;

    // --- Events ---

    // Emitted whenever a new campaign is successfully created.
    // This allows our frontend to easily listen for new projects.
    event CampaignCreated(address indexed researcher, address campaignAddress, uint256 fundingGoal, uint256 deadline);

    // --- Functions ---

    /**
     * @notice The core function to create and deploy a new Campaign contract.
     * @param _fundingGoal The amount of funds the researcher wants to raise.
     * @param _deadlineInSeconds The duration of the campaign in seconds from now.
     */
    function createCampaign(uint256 _fundingGoal, uint256 _deadlineInSeconds) public {
        // The `new` keyword is the magic here. It deploys a fresh instance of the Campaign contract.
        // We pass the arguments directly to the Campaign's constructor.
        // The researcher is the person who called this function (msg.sender).
        Campaign newCampaign = new Campaign(msg.sender, _fundingGoal, _deadlineInSeconds);

        // We store the address of the newly created contract in our array.
        s_deployedCampaigns.push(address(newCampaign));

        // We emit an event to notify the outside world (like our dApp) that a new campaign is live.
        emit CampaignCreated(msg.sender, address(newCampaign), _fundingGoal, block.timestamp + _deadlineInSeconds);
    }

    /**
     * @notice A helper function to view all campaigns that have been deployed.
     * @return A memory array of all campaign contract addresses.
     */
    function getDeployedCampaigns() public view returns (address[] memory) {
        return s_deployedCampaigns;
    }
}
