// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Campaign
 * @author Tyler Ko
 * @notice This is the contract for a research campaign.
 * A new instance of this contract is deployed for every new project.
 */
contract Campaign {
    // --- State Variables ---

    address public immutable i_researcher;
    uint256 public immutable i_fundingGoal;
    uint256 public immutable i_deadline;

    // --- Constructor ---

    /**
     * @dev Sets up the initial state of the campaign. This is called by the factory.
     * @param _researcher The wallet address of the researcher.
     * @param _fundingGoal The amount of funds they want to raise.
     * @param _deadlineInSeconds The duration of the campaign in seconds from now.
     */
    constructor(address _researcher, uint256 _fundingGoal, uint256 _deadlineInSeconds) {
        i_researcher = _researcher;
        i_fundingGoal = _fundingGoal;
        i_deadline = block.timestamp + _deadlineInSeconds;
    }

    // --- Future Functions ---

    // function fund() public payable { ... }
    // function withdrawFunds() public { ... }
    // function claimRefund() public { ... }
    // function submitResearchUpdate(string memory dataHash) public { ... }
}
