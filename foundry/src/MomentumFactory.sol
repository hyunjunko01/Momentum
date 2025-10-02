// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Campaign} from "./Campaign.sol";

/**
 * @title MomentumFactory
 * @author Tyler Ko
 * @notice A factory contract to deploy and manage all research campaigns on the Momentum platform.
 * @dev Implements pagination and indexing for efficient campaign management.
 */
contract MomentumFactory {
    // --- Custom Errors ---
    error MomentumFactory__InvalidFundingGoal();
    error MomentumFactory__InvalidDeadline();
    error MomentumFactory__CampaignCreationFailed();

    // --- Constants ---
    uint256 public constant MIN_FUNDING_GOAL = 0.01 ether;
    uint256 public constant MAX_FUNDING_GOAL = 1000 ether;
    uint256 public constant MIN_DEADLINE = 1 days;
    uint256 public constant MAX_DEADLINE = 365 days;

    // --- State Variables ---

    // All deployed campaigns
    address[] private s_deployedCampaigns;

    // Mapping from researcher address to their campaign addresses
    mapping(address => address[]) private s_researcherCampaigns;

    // Mapping to check if an address is a valid campaign
    mapping(address => bool) public s_isValidCampaign;

    // Campaign metadata (optional but recommended)
    struct CampaignMetadata {
        string title;
        string description;
        string category;
        uint256 createdAt;
        address researcher;
    }

    mapping(address => CampaignMetadata) public s_campaignMetadata;

    // --- Events ---
    event CampaignCreated(
        address indexed researcher, address indexed campaignAddress, uint256 fundingGoal, uint256 deadline, string title
    );

    // --- Functions ---

    /**
     * @notice Creates a new research campaign with metadata
     * @param _fundingGoal The amount of funds to raise (must be within limits)
     * @param _deadlineInSeconds Campaign duration (must be within limits)
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _category Research category
     * @return campaignAddress The address of the newly created campaign
     */
    function createCampaign(
        uint256 _fundingGoal,
        uint256 _deadlineInSeconds,
        string memory _title,
        string memory _description,
        string memory _category
    ) public returns (address campaignAddress) {
        // Input validation
        if (_fundingGoal < MIN_FUNDING_GOAL || _fundingGoal > MAX_FUNDING_GOAL) {
            revert MomentumFactory__InvalidFundingGoal();
        }
        if (_deadlineInSeconds < MIN_DEADLINE || _deadlineInSeconds > MAX_DEADLINE) {
            revert MomentumFactory__InvalidDeadline();
        }

        // Deploy new campaign
        Campaign newCampaign = new Campaign(msg.sender, _fundingGoal, _deadlineInSeconds);
        campaignAddress = address(newCampaign);

        // Verify deployment succeeded
        if (campaignAddress == address(0)) {
            revert MomentumFactory__CampaignCreationFailed();
        }

        // Store campaign reference
        s_deployedCampaigns.push(campaignAddress);
        s_researcherCampaigns[msg.sender].push(campaignAddress);
        s_isValidCampaign[campaignAddress] = true;

        // Store metadata
        s_campaignMetadata[campaignAddress] = CampaignMetadata({
            title: _title,
            description: _description,
            category: _category,
            createdAt: block.timestamp,
            researcher: msg.sender
        });

        emit CampaignCreated(msg.sender, campaignAddress, _fundingGoal, block.timestamp + _deadlineInSeconds, _title);
    }

    /**
     * @notice Simplified version without metadata (backward compatible)
     */
    function createCampaign(uint256 _fundingGoal, uint256 _deadlineInSeconds) public returns (address) {
        return createCampaign(_fundingGoal, _deadlineInSeconds, "", "", "");
    }

    /**
     * @notice Get paginated list of all campaigns
     * @param _offset Starting index
     * @param _limit Number of campaigns to return
     * @return campaigns Array of campaign addresses
     */
    function getDeployedCampaigns(uint256 _offset, uint256 _limit) public view returns (address[] memory campaigns) {
        uint256 totalCampaigns = s_deployedCampaigns.length;

        if (_offset >= totalCampaigns) {
            return new address[](0);
        }

        uint256 end = _offset + _limit;
        if (end > totalCampaigns) {
            end = totalCampaigns;
        }

        uint256 size = end - _offset;
        campaigns = new address[](size);

        for (uint256 i = 0; i < size; i++) {
            campaigns[i] = s_deployedCampaigns[_offset + i];
        }
    }

    /**
     * @notice Get all campaigns (use with caution for large arrays)
     * @dev Consider using paginated version for production
     */
    function getAllDeployedCampaigns() public view returns (address[] memory) {
        return s_deployedCampaigns;
    }

    /**
     * @notice Get campaigns created by a specific researcher
     * @param _researcher The researcher's address
     * @return Array of campaign addresses
     */
    function getCampaignsByResearcher(address _researcher) public view returns (address[] memory) {
        return s_researcherCampaigns[_researcher];
    }

    /**
     * @notice Get total number of campaigns
     */
    function getTotalCampaigns() public view returns (uint256) {
        return s_deployedCampaigns.length;
    }

    /**
     * @notice Get metadata for a campaign
     * @param _campaign Campaign address
     * @return Metadata struct
     */
    function getCampaignMetadata(address _campaign) public view returns (CampaignMetadata memory) {
        return s_campaignMetadata[_campaign];
    }

    /**
     * @notice Check if an address is a valid campaign created by this factory
     * @param _campaign Address to check
     * @return bool True if valid campaign
     */
    function isValidCampaign(address _campaign) public view returns (bool) {
        return s_isValidCampaign[_campaign];
    }

    /**
     * @notice Get campaign details in a single call
     * @param _campaign Campaign address
     * @return researcher Campaign creator
     * @return fundingGoal Funding goal
     * @return deadline Deadline timestamp
     * @return state Current state
     * @return totalFunded Total funded amount
     */
    function getCampaignDetails(address _campaign)
        public
        view
        returns (
            address researcher,
            uint256 fundingGoal,
            uint256 deadline,
            Campaign.CampaignState state,
            uint256 totalFunded
        )
    {
        Campaign campaign = Campaign(_campaign);
        return (
            campaign.i_researcher(),
            campaign.i_fundingGoal(),
            campaign.i_deadline(),
            campaign.s_campaignState(),
            campaign.s_totalFunded()
        );
    }
}
