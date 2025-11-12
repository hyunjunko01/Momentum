// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {MomentumFactory} from "../src/MomentumFactory.sol";
import {Campaign} from "../src/Campaign.sol";

contract MomentumFactoryTest is Test {
    MomentumFactory public factory;

    address public researcher = makeAddr("researcher");
    address public researcher2 = makeAddr("researcher2");
    address public user1 = makeAddr("user1");

    uint256 public constant VALID_FUNDING_GOAL = 1 ether;
    uint256 public constant VALID_DEADLINE = 30 days;
    string public constant METADATA_URI = "ipfs://QmTest123";
    string public constant TITLE = "Research Project";
    string public constant DESCRIPTION = "A groundbreaking research project";
    string public constant CATEGORY = "Biology";

    event CampaignCreated(
        address indexed researcher, address indexed campaignAddress, uint256 fundingGoal, uint256 deadline, string title
    );

    function setUp() public {
        factory = new MomentumFactory();
    }

    /*//////////////////////////////////////////////////////////////
                        CREATE CAMPAIGN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateCampaign_Success() public {
        vm.startPrank(researcher);

        vm.expectEmit(true, false, false, true);
        emit CampaignCreated(
            researcher,
            address(0), // We don't know the address beforehand
            VALID_FUNDING_GOAL,
            block.timestamp + VALID_DEADLINE,
            TITLE
        );

        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        vm.stopPrank();

        // Verify campaign was created
        assertTrue(campaignAddress != address(0));
        assertTrue(factory.s_isValidCampaign(campaignAddress));

        // Verify campaign is in deployed campaigns list
        address[] memory deployedCampaigns = factory.getAllDeployedCampaigns();
        assertEq(deployedCampaigns.length, 1);
        assertEq(deployedCampaigns[0], campaignAddress);

        // Verify campaign is in researcher's campaigns
        address[] memory researcherCampaigns = factory.getCampaignsByResearcher(researcher);
        assertEq(researcherCampaigns.length, 1);
        assertEq(researcherCampaigns[0], campaignAddress);

        // Verify metadata
        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, TITLE);
        assertEq(metadata.description, DESCRIPTION);
        assertEq(metadata.metadataURI, METADATA_URI);
        assertEq(metadata.category, CATEGORY);
        assertEq(metadata.researcher, researcher);
        assertEq(metadata.createdAt, block.timestamp);
    }

    function test_CreateCampaign_RevertsIfFundingGoalTooLow() public {
        vm.startPrank(researcher);

        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(
            0.005 ether, // Below MIN_FUNDING_GOAL (0.01 ether)
            VALID_DEADLINE,
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );

        vm.stopPrank();
    }

    function test_CreateCampaign_RevertsIfFundingGoalTooHigh() public {
        vm.startPrank(researcher);

        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(
            1001 ether, // Above MAX_FUNDING_GOAL (1000 ether)
            VALID_DEADLINE,
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );

        vm.stopPrank();
    }

    function test_CreateCampaign_RevertsIfDeadlineTooShort() public {
        vm.startPrank(researcher);

        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(
            VALID_FUNDING_GOAL,
            12 hours, // Below MIN_DEADLINE (1 day)
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );

        vm.stopPrank();
    }

    function test_CreateCampaign_RevertsIfDeadlineTooLong() public {
        vm.startPrank(researcher);

        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(
            VALID_FUNDING_GOAL,
            366 days, // Above MAX_DEADLINE (365 days)
            METADATA_URI,
            TITLE,
            DESCRIPTION,
            CATEGORY
        );

        vm.stopPrank();
    }

    function test_CreateCampaign_AcceptsMinimumFundingGoal() public {
        vm.startPrank(researcher);

        address campaignAddress = factory.createCampaign(
            factory.MIN_FUNDING_GOAL(), VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
        vm.stopPrank();
    }

    function test_CreateCampaign_AcceptsMaximumFundingGoal() public {
        vm.startPrank(researcher);

        address campaignAddress = factory.createCampaign(
            factory.MAX_FUNDING_GOAL(), VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
        vm.stopPrank();
    }

    function test_CreateCampaign_AcceptsMinimumDeadline() public {
        vm.startPrank(researcher);

        address campaignAddress = factory.createCampaign(
            VALID_FUNDING_GOAL, factory.MIN_DEADLINE(), METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
        vm.stopPrank();
    }

    function test_CreateCampaign_AcceptsMaximumDeadline() public {
        vm.startPrank(researcher);

        address campaignAddress = factory.createCampaign(
            VALID_FUNDING_GOAL, factory.MAX_DEADLINE(), METADATA_URI, TITLE, DESCRIPTION, CATEGORY
        );

        assertTrue(campaignAddress != address(0));
        vm.stopPrank();
    }

    function test_CreateCampaign_MultipleCampaignsBySameResearcher() public {
        vm.startPrank(researcher);

        address campaign1 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, "Project 1", DESCRIPTION, CATEGORY);

        address campaign2 = factory.createCampaign(
            VALID_FUNDING_GOAL * 2, VALID_DEADLINE, METADATA_URI, "Project 2", DESCRIPTION, CATEGORY
        );

        vm.stopPrank();

        address[] memory researcherCampaigns = factory.getCampaignsByResearcher(researcher);
        assertEq(researcherCampaigns.length, 2);
        assertEq(researcherCampaigns[0], campaign1);
        assertEq(researcherCampaigns[1], campaign2);

        assertEq(factory.getTotalCampaigns(), 2);
    }

    function test_CreateCampaign_MultipleCampaignsByDifferentResearchers() public {
        vm.prank(researcher);
        address campaign1 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        vm.prank(researcher2);
        address campaign2 =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        // Check researcher 1 campaigns
        address[] memory researcher1Campaigns = factory.getCampaignsByResearcher(researcher);
        assertEq(researcher1Campaigns.length, 1);
        assertEq(researcher1Campaigns[0], campaign1);

        // Check researcher 2 campaigns
        address[] memory researcher2Campaigns = factory.getCampaignsByResearcher(researcher2);
        assertEq(researcher2Campaigns.length, 1);
        assertEq(researcher2Campaigns[0], campaign2);

        // Check total campaigns
        assertEq(factory.getTotalCampaigns(), 2);
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetAllDeployedCampaigns_EmptyInitially() public view {
        address[] memory campaigns = factory.getAllDeployedCampaigns();
        assertEq(campaigns.length, 0);
    }

    function test_GetCampaignsByResearcher_EmptyForNewResearcher() public view {
        address[] memory campaigns = factory.getCampaignsByResearcher(user1);
        assertEq(campaigns.length, 0);
    }

    function test_GetTotalCampaigns_StartsAtZero() public view {
        assertEq(factory.getTotalCampaigns(), 0);
    }

    function test_IsValidCampaign_ReturnsFalseForNonCampaign() public view {
        assertFalse(factory.s_isValidCampaign(user1));
    }

    function test_GetCampaignDetails() public {
        vm.prank(researcher);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        (
            address returnedResearcher,
            uint256 fundingGoal,
            uint256 deadline,
            Campaign.CampaignState state,
            uint256 totalFunded
        ) = factory.getCampaignDetails(campaignAddress);

        assertEq(returnedResearcher, researcher);
        assertEq(fundingGoal, VALID_FUNDING_GOAL);
        assertEq(deadline, block.timestamp + VALID_DEADLINE);
        assertTrue(state == Campaign.CampaignState.Open);
        assertEq(totalFunded, 0);
    }

    /*//////////////////////////////////////////////////////////////
                        FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_CreateCampaign_ValidInputs(uint256 fundingGoal, uint256 deadline) public {
        // Bound inputs to valid ranges
        fundingGoal = bound(fundingGoal, factory.MIN_FUNDING_GOAL(), factory.MAX_FUNDING_GOAL());
        deadline = bound(deadline, factory.MIN_DEADLINE(), factory.MAX_DEADLINE());

        vm.prank(researcher);
        address campaignAddress =
            factory.createCampaign(fundingGoal, deadline, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);

        assertTrue(campaignAddress != address(0));
        assertTrue(factory.s_isValidCampaign(campaignAddress));
    }

    function testFuzz_CreateCampaign_RevertsOnInvalidFundingGoal(uint256 fundingGoal) public {
        // Test values outside valid range
        vm.assume(fundingGoal < factory.MIN_FUNDING_GOAL() || fundingGoal > factory.MAX_FUNDING_GOAL());

        vm.prank(researcher);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(fundingGoal, VALID_DEADLINE, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);
    }

    function testFuzz_CreateCampaign_RevertsOnInvalidDeadline(uint256 deadline) public {
        // Test values outside valid range
        vm.assume(deadline < factory.MIN_DEADLINE() || deadline > factory.MAX_DEADLINE());

        vm.prank(researcher);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(VALID_FUNDING_GOAL, deadline, METADATA_URI, TITLE, DESCRIPTION, CATEGORY);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTANTS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Constants() public view {
        assertEq(factory.MIN_FUNDING_GOAL(), 0.01 ether);
        assertEq(factory.MAX_FUNDING_GOAL(), 1000 ether);
        assertEq(factory.MIN_DEADLINE(), 1 days);
        assertEq(factory.MAX_DEADLINE(), 365 days);
    }
}
