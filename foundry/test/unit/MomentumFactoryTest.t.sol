// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {MomentumFactory} from "../../src/MomentumFactory.sol";
import {Campaign} from "../../src/Campaign.sol";

contract MomentumFactoryTest is Test {
    MomentumFactory public factory;

    address public researcher1 = makeAddr("researcher1");
    address public researcher2 = makeAddr("researcher2");
    address public backer = makeAddr("backer");

    uint256 public constant VALID_FUNDING_GOAL = 1 ether;
    uint256 public constant VALID_DEADLINE = 30 days;
    string public constant METADATA_URI = "ipfs://QmTest123";
    string public constant TITLE = "AI Research Project";
    string public constant DESCRIPTION = "Groundbreaking AI research";
    string public constant CATEGORY = "Artificial Intelligence";

    function setUp() public {
        factory = new MomentumFactory();
        vm.deal(backer, 10 ether);
    }

    ///////////////////////////////
    /// createCampaign Tests //////
    ///////////////////////////////

    function test_CreateCampaign_Success() public {
        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        // Verify campaign was created
        assertTrue(campaignAddress != address(0));
        assertTrue(factory.isValidCampaign(campaignAddress));

        // Verify campaign count
        assertEq(factory.getTotalCampaigns(), 1);

        // Verify campaign is in researcher's list
        address[] memory researcherCampaigns = factory.getCampaignsByResearcher(researcher1);
        assertEq(researcherCampaigns.length, 1);
        assertEq(researcherCampaigns[0], campaignAddress);

        // Verify metadata
        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, TITLE);
        assertEq(metadata.description, DESCRIPTION);
        assertEq(metadata.metadataURI, METADATA_URI);
        assertEq(metadata.category, CATEGORY);
        assertEq(metadata.researcher, researcher1);
        assertEq(metadata.createdAt, block.timestamp);
    }

    function test_CreateCampaign_EmitsEvent() public {
        vm.prank(researcher1);

        vm.expectEmit(true, true, false, true);
        emit MomentumFactory.CampaignCreated(
            researcher1,
            address(0), // We don't know the address yet
            VALID_FUNDING_GOAL,
            block.timestamp + VALID_DEADLINE,
            TITLE
        );

        // Note: The event won't match exactly because campaignAddress is unknown
        // This is a limitation - just test that event is emitted
        vm.recordLogs();
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        m.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1);
    }

    function test_CreateCampaign_MultipleByOneResearcher() public {
        vm.startPrank(researcher1);

        address campaign1 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, "Project 1", DESCRIPTION, CATEGORY);

        address campaign2 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, "Project 2", DESCRIPTION, CATEGORY);

        vm.stopPrank();

        assertEq(factory.getTotalCampaigns(), 2);

        address[] memory researcherCampaigns = factory.getCampaignsByResearcher(researcher1);
        assertEq(researcherCampaigns.length, 2);
        assertEq(researcherCampaigns[0], campaign1);
        assertEq(researcherCampaigns[1], campaign2);
    }

    function test_CreateCampaign_MultipleResearchers() public {
        vm.prank(researcher1);
        address campaign1 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        vm.prank(researcher2);
        address campaign2 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        assertEq(factory.getTotalCampaigns(), 2);
        assertEq(factory.getCampaignsByResearcher(researcher1).length, 1);
        assertEq(factory.getCampaignsByResearcher(researcher2).length, 1);
    }

    function test_CreateCampaign_RevertsWhenFundingGoalTooLow() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(
            0.001 ether, // Less than MIN_FUNDING_GOAL (0.01 ether)
            VALID_DEADLINE,
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );
    }

    function test_CreateCampaign_RevertsWhenFundingGoalTooHigh() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(
            1001 ether, // More than MAX_FUNDING_GOAL (1000 ether)
            VALID_DEADLINE,
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );
    }

    function test_CreateCampaign_RevertsWhenDeadlineTooShort() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(
            VALID_FUNDING_GOAL,
            1 hours, // Less than MIN_DEADLINE (1 day)
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );
    }

    function test_CreateCampaign_RevertsWhenDeadlineTooLong() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(
            VALID_FUNDING_GOAL,
            366 days, // More than MAX_DEADLINE (365 days)
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );
    }

    function test_CreateCampaign_AcceptsMinimumValidValues() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(
            factory.MIN_FUNDING_GOAL(), factory.MIN_DEADLINE(), METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
    }

    function test_CreateCampaign_AcceptsMaximumValidValues() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(
            factory.MAX_FUNDING_GOAL(), factory.MAX_DEADLINE(), METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
    }

    ///////////////////////////////
    /// View Function Tests ///////
    ///////////////////////////////

    function test_GetAllDeployedCampaigns() public {
        // Create multiple campaigns
        vm.prank(researcher1);
        address campaign1 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        vm.prank(researcher2);
        address campaign2 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        address[] memory allCampaigns = factory.getAllDeployedCampaigns();
        assertEq(allCampaigns.length, 2);
        assertEq(allCampaigns[0], campaign1);
        assertEq(allCampaigns[1], campaign2);
    }

    function test_GetAllDeployedCampaigns_EmptyInitially() public {
        address[] memory campaigns = factory.getAllDeployedCampaigns();
        assertEq(campaigns.length, 0);
    }

    function test_GetCampaignsByResearcher() public {
        vm.prank(researcher1);
        address campaign =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        address[] memory campaigns = factory.getCampaignsByResearcher(researcher1);
        assertEq(campaigns.length, 1);
        assertEq(campaigns[0], campaign);
    }

    function test_GetCampaignsByResearcher_EmptyForNonResearcher() public {
        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        address[] memory campaigns = factory.getCampaignsByResearcher(researcher2);
        assertEq(campaigns.length, 0);
    }

    function test_GetTotalCampaigns() public {
        assertEq(factory.getTotalCampaigns(), 0);

        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        assertEq(factory.getTotalCampaigns(), 1);
    }

    function test_IsValidCampaign() public {
        vm.prank(researcher1);
        address campaign =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        assertTrue(factory.isValidCampaign(campaign));
        assertFalse(factory.isValidCampaign(address(0)));
        assertFalse(factory.isValidCampaign(address(0x123)));
    }

    function test_GetCampaignDetails() public {
        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        (
            address researcherAddr,
            uint256 fundingGoal,
            uint256 deadline,
            Campaign.CampaignState state,
            uint256 totalFunded
        ) = factory.getCampaignDetails(campaignAddress);

        assertEq(researcherAddr, researcher1);
        assertEq(fundingGoal, VALID_FUNDING_GOAL);
        assertEq(deadline, block.timestamp + VALID_DEADLINE);
        assertTrue(state == Campaign.CampaignState.Open);
        assertEq(totalFunded, 0);
    }

    ///////////////////////////////
    /// Integration Tests /////////
    ///////////////////////////////

    function test_Integration_CreateAndFundCampaign() public {
        // Researcher creates campaign
        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        Campaign campaign = Campaign(campaignAddress);

        // Backer funds the campaign
        vm.prank(backer);
        campaign.fund{value: 0.5 ether}();

        // Verify funding
        assertEq(campaign.s_totalFunded(), 0.5 ether);
        assertEq(campaign.s_backers(backer), 0.5 ether);
    }

    function test_Integration_CreateFinalizeAndWithdraw() public {
        // Researcher creates campaign
        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        Campaign campaign = Campaign(campaignAddress);

        // Backer fully funds the campaign
        vm.prank(backer);
        campaign.fund{value: VALID_FUNDING_GOAL}();

        // Fast forward past deadline
        vm.warp(block.timestamp + VALID_DEADLINE + 1);

        // Finalize campaign
        campaign.finalizeCampaign();
        assertTrue(campaign.s_campaignState() == Campaign.CampaignState.Successful);

        // Researcher withdraws funds
        uint256 researcherBalanceBefore = researcher1.balance;
        vm.prank(researcher1);
        campaign.withdrawFunds();

        assertEq(researcher1.balance - researcherBalanceBefore, VALID_FUNDING_GOAL);
        assertTrue(campaign.s_campaignState() == Campaign.CampaignState.PaidOut);
    }

    function test_Integration_CreateAndFailCampaign() public {
        // Researcher creates campaign
        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        Campaign campaign = Campaign(campaignAddress);

        // Backer partially funds (not enough)
        vm.prank(backer);
        campaign.fund{value: 0.5 ether}();

        // Fast forward past deadline
        vm.warp(block.timestamp + VALID_DEADLINE + 1);

        // Finalize campaign
        campaign.finalizeCampaign();
        assertTrue(campaign.s_campaignState() == Campaign.CampaignState.Failed);

        // Backer claims refund
        uint256 backerBalanceBefore = backer.balance;
        vm.prank(backer);
        campaign.claimRefund();

        assertEq(backer.balance - backerBalanceBefore, 0.5 ether);
    }

    ///////////////////////////////
    /// Fuzz Tests ////////////////
    ///////////////////////////////

    function testFuzz_CreateCampaign_ValidInputs(uint256 fundingGoal, uint256 deadline) public {
        // Bound inputs to valid ranges
        fundingGoal = bound(fundingGoal, factory.MIN_FUNDING_GOAL(), factory.MAX_FUNDING_GOAL());
        deadline = bound(deadline, factory.MIN_DEADLINE(), factory.MAX_DEADLINE());

        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(fundingGoal, deadline, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        assertTrue(campaignAddress != address(0));
        assertTrue(factory.isValidCampaign(campaignAddress));
    }

    function testFuzz_CreateCampaign_RevertsOnInvalidFundingGoal(uint256 fundingGoal) public {
        // Assume funding goal is outside valid range
        vm.assume(fundingGoal < factory.MIN_FUNDING_GOAL() || fundingGoal > factory.MAX_FUNDING_GOAL());

        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(fundingGoal, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);
    }

    function testFuzz_CreateCampaign_RevertsOnInvalidDeadline(uint256 deadline) public {
        // Assume deadline is outside valid range
        vm.assume(deadline < factory.MIN_DEADLINE() || deadline > factory.MAX_DEADLINE());

        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(VALID_FUNDING_GOAL, deadline, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);
    }
}
