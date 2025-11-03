// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Campaign
 * @author Tyler Ko
 * @notice A robust and secure contract for a single research campaign,
 * implementing a clear state machine and best practices.
 */
contract Campaign is ReentrancyGuard {
    // --- Custom Errors ---
    // Custom errors are more gas-efficient than require statements with strings.
    error Campaign__NotResearcher();
    error Campaign__NotInOpenState();
    error Campaign__NotInSuccessfulState();
    error Campaign__NotInFailedState();
    error Campaign__DeadlineNotPassed();
    error Campaign__DeadlineHasPassed();
    error Campaign__TransferFailed();
    error Campaign__AlreadyFinalized();
    error Campaign__MustSendMoreThanZero();
    error Campaign__NoFundsToRefund();
    error Campaign__NotInCorrectStateForUpdate();

    // --- Enums ---
    // Defines the lifecycle stages of the campaign.
    enum CampaignState {
        Open, // Accepting funds
        Successful, // Goal met by deadline
        Failed, // Goal not met by deadline
        PaidOut // Funds withdrawn by researcher

    }

    // --- State Variables ---
    address public immutable i_researcher;
    uint256 public immutable i_fundingGoal;
    uint256 public immutable i_deadline;

    CampaignState public s_campaignState;
    uint256 public s_totalFunded;

    // Mapping from a backer's address to their contribution amount.
    mapping(address => uint256) public s_backers;

    string[] public s_researchUpdates;

    // --- Events ---
    event CampaignFunded(address indexed funder, uint256 amount);
    event CampaignWithdrawn(address indexed researcher, uint256 amount);
    event CampaignFinalized(CampaignState finalState);
    event Refunded(address indexed backer, uint256 amount);
    event ResearchUpdateSubmitted(address indexed researcher, string ipfsHash);

    // --- Modifiers ---
    modifier onlyResearcher() {
        if (msg.sender != i_researcher) {
            revert Campaign__NotResearcher();
        }
        _;
    }

    // --- Constructor ---
    constructor(address _researcher, uint256 _fundingGoal, uint256 _deadlineInSeconds) {
        i_researcher = _researcher;
        i_fundingGoal = _fundingGoal;
        i_deadline = block.timestamp + _deadlineInSeconds;
        s_campaignState = CampaignState.Open;
    }

    // --- Core Functions ---

    /**
     * @notice Allows anyone to fund the campaign before the deadline.
     */
    function fund() external payable {
        // This function should only be callable when the campaign is Open.
        if (s_campaignState != CampaignState.Open) {
            revert Campaign__NotInOpenState();
        }
        // It must be called before the deadline.
        if (block.timestamp > i_deadline) {
            revert Campaign__DeadlineHasPassed();
        }
        // The contribution must be greater than zero.
        if (msg.value == 0) {
            revert Campaign__MustSendMoreThanZero();
        }

        s_backers[msg.sender] += msg.value;
        s_totalFunded += msg.value;
        emit CampaignFunded(msg.sender, msg.value);
    }

    /**
     * @notice Anyone can call this function after the deadline has passed
     * to transition the campaign from 'Open' to 'Successful' or 'Failed'.
     * This is a critical state transition that should happen only once.
     */
    function finalizeCampaign() external {
        // Can only be called after the deadline.
        if (block.timestamp <= i_deadline) {
            revert Campaign__DeadlineNotPassed();
        }
        // Can only be called if the campaign is still Open.
        if (s_campaignState != CampaignState.Open) {
            revert Campaign__AlreadyFinalized();
        }

        if (s_totalFunded >= i_fundingGoal) {
            s_campaignState = CampaignState.Successful;
        } else {
            s_campaignState = CampaignState.Failed;
        }
        emit CampaignFinalized(s_campaignState);
    }

    /**
     * @notice The researcher can withdraw the funds only if the campaign was successful.
     */
    function withdrawFunds() external onlyResearcher nonReentrant {
        if (s_campaignState != CampaignState.Successful) {
            revert Campaign__NotInSuccessfulState();
        }

        uint256 amountToWithdraw = address(this).balance;
        s_campaignState = CampaignState.PaidOut;

        (bool success,) = i_researcher.call{value: amountToWithdraw}("");
        if (!success) {
            revert Campaign__TransferFailed(); // 상태 되돌리지 않기!
        }

        emit CampaignWithdrawn(i_researcher, amountToWithdraw);
    }

    /**
     * @notice Backers can claim a refund only if the campaign failed.
     */
    function claimRefund() external nonReentrant {
        if (s_campaignState != CampaignState.Failed) {
            revert Campaign__NotInFailedState();
        }

        // Apply the Checks-Effects-Interactions pattern.

        // Checks: Get the amount this user is owed.
        uint256 fundedAmount = s_backers[msg.sender];
        if (fundedAmount == 0) {
            revert Campaign__NoFundsToRefund(); // Re-using error for "no funds to claim"
        }

        // Effects: Set the user's balance to zero BEFORE sending money.
        // This is the critical step to prevent re-entrancy attacks.
        s_backers[msg.sender] = 0;

        // Interactions: Send the refund.
        (bool success,) = msg.sender.call{value: fundedAmount}("");
        if (!success) {
            // If the transfer fails, revert the state change and the transaction.
            revert Campaign__TransferFailed();
        }
        emit Refunded(msg.sender, fundedAmount);
    }

    function submitResearchUpdate(string memory _ipfsHash) external onlyResearcher {
        // when the campaign is in Failed state, updates are not allowed
        if (s_campaignState == CampaignState.Failed) {
            revert Campaign__NotInCorrectStateForUpdate();
        }

        s_researchUpdates.push(_ipfsHash);

        emit ResearchUpdateSubmitted(msg.sender, _ipfsHash);
    }

    /**
     * @notice returns the list of research updates
     */
    function getResearchUpdates() public view returns (string[] memory) {
        return s_researchUpdates;
    }
}
