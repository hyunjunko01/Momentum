// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {MomentumFactory} from "../../src/MomentumFactory.sol";
import {Campaign} from "../../src/Campaign.sol";

contract MomentumFactoryTest is Test {
    MomentumFactory public factory;

    address public researcher1 = makeAddr("researcher1");
    address public researcher2 = makeAddr("researcher2");
    address public researcher3 = makeAddr("researcher3");
    address public backer = makeAddr("backer");

    uint256 public constant VALID_FUNDING_GOAL = 10 ether;
    uint256 public constant VALID_DEADLINE = 30 days;
    string public constant CAMPAIGN_TITLE = "AI Research Project";
    string public constant CAMPAIGN_DESCRIPTION = "Revolutionary AI research";
    string public constant CAMPAIGN_CATEGORY = "Artificial Intelligence";

    event CampaignCreated(
        address indexed researcher, address indexed campaignAddress, uint256 fundingGoal, uint256 deadline, string title
    );

    function setUp() public {
        factory = new MomentumFactory();
        vm.deal(backer, 100 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR & CONSTANTS
    //////////////////////////////////////////////////////////////*/

    function test_ConstantsAreSetCorrectly() public view {
        assertEq(factory.MIN_FUNDING_GOAL(), 0.01 ether);
        assertEq(factory.MAX_FUNDING_GOAL(), 1000 ether);
        assertEq(factory.MIN_DEADLINE(), 1 days);
        assertEq(factory.MAX_DEADLINE(), 365 days);
    }

    function test_InitialStateIsEmpty() public view {
        assertEq(factory.getTotalCampaigns(), 0);
        address[] memory campaigns = factory.getAllDeployedCampaigns();
        assertEq(campaigns.length, 0);
    }

    /*//////////////////////////////////////////////////////////////
                    CREATE CAMPAIGN - SUCCESS CASES
    //////////////////////////////////////////////////////////////*/

    function test_CreateCampaignWithMetadata() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(
            VALID_FUNDING_GOAL, VALID_DEADLINE, CAMPAIGN_TITLE, CAMPAIGN_DESCRIPTION, CAMPAIGN_CATEGORY
        );

        // Verify campaign was created
        assertTrue(campaignAddress != address(0));
        assertTrue(factory.isValidCampaign(campaignAddress));

        // Verify metadata
        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, CAMPAIGN_TITLE);
        assertEq(metadata.description, CAMPAIGN_DESCRIPTION);
        assertEq(metadata.category, CAMPAIGN_CATEGORY);
        assertEq(metadata.researcher, researcher1);
        assertEq(metadata.createdAt, block.timestamp);
    }

    function test_CreateCampaignWithoutMetadata() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        assertTrue(campaignAddress != address(0));
        assertTrue(factory.isValidCampaign(campaignAddress));

        // Metadata should be empty
        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, "");
        assertEq(metadata.description, "");
        assertEq(metadata.category, "");
    }

    function test_CreateCampaignIncrementsCounter() public {
        assertEq(factory.getTotalCampaigns(), 0);

        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        assertEq(factory.getTotalCampaigns(), 1);

        vm.prank(researcher2);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        assertEq(factory.getTotalCampaigns(), 2);
    }

    function test_CreateCampaignAddsToResearcherList() public {
        vm.prank(researcher1);
        address campaign1 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        vm.prank(researcher1);
        address campaign2 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        address[] memory researcherCampaigns = factory.getCampaignsByResearcher(researcher1);
        assertEq(researcherCampaigns.length, 2);
        assertEq(researcherCampaigns[0], campaign1);
        assertEq(researcherCampaigns[1], campaign2);
    }

    function test_CreateCampaignSetsCorrectParameters() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        Campaign campaign = Campaign(campaignAddress);

        assertEq(campaign.i_researcher(), researcher1);
        assertEq(campaign.i_fundingGoal(), VALID_FUNDING_GOAL);
        assertEq(campaign.i_deadline(), block.timestamp + VALID_DEADLINE);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Open));
    }

    /*//////////////////////////////////////////////////////////////
                    CREATE CAMPAIGN - VALIDATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateCampaignRevertsIfFundingGoalTooLow() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(0.009 ether, VALID_DEADLINE);
    }

    function test_CreateCampaignRevertsIfFundingGoalTooHigh() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidFundingGoal.selector);
        factory.createCampaign(1001 ether, VALID_DEADLINE);
    }

    function test_CreateCampaignRevertsIfDeadlineTooShort() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(VALID_FUNDING_GOAL, 23 hours);
    }

    function test_CreateCampaignRevertsIfDeadlineTooLong() public {
        vm.prank(researcher1);
        vm.expectRevert(MomentumFactory.MomentumFactory__InvalidDeadline.selector);
        factory.createCampaign(VALID_FUNDING_GOAL, 366 days);
    }

    function test_CreateCampaignAcceptsMinimumValues() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(factory.MIN_FUNDING_GOAL(), factory.MIN_DEADLINE());

        assertTrue(campaignAddress != address(0));
    }

    function test_CreateCampaignAcceptsMaximumValues() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(factory.MAX_FUNDING_GOAL(), factory.MAX_DEADLINE());

        assertTrue(campaignAddress != address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER FUNCTIONS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetAllDeployedCampaigns() public {
        vm.prank(researcher1);
        address campaign1 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        vm.prank(researcher2);
        address campaign2 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        address[] memory campaigns = factory.getAllDeployedCampaigns();
        assertEq(campaigns.length, 2);
        assertEq(campaigns[0], campaign1);
        assertEq(campaigns[1], campaign2);
    }

    function test_GetDeployedCampaignsPaginated() public {
        // Create 5 campaigns
        address[] memory created = new address[](5);
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(researcher1);
            created[i] = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        }

        // Get first 2
        address[] memory page1 = factory.getDeployedCampaigns(0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[0], created[0]);
        assertEq(page1[1], created[1]);

        // Get next 2
        address[] memory page2 = factory.getDeployedCampaigns(2, 2);
        assertEq(page2.length, 2);
        assertEq(page2[0], created[2]);
        assertEq(page2[1], created[3]);

        // Get last page
        address[] memory page3 = factory.getDeployedCampaigns(4, 2);
        assertEq(page3.length, 1);
        assertEq(page3[0], created[4]);
    }

    function test_GetDeployedCampaignsPaginatedOffsetTooHigh() public {
        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        address[] memory campaigns = factory.getDeployedCampaigns(10, 5);
        assertEq(campaigns.length, 0);
    }

    function test_GetCampaignsByResearcher() public {
        // Researcher1 creates 2 campaigns
        vm.prank(researcher1);
        address r1c1 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        vm.prank(researcher1);
        address r1c2 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        // Researcher2 creates 1 campaign
        vm.prank(researcher2);
        address r2c1 = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        // Verify researcher1's campaigns
        address[] memory r1Campaigns = factory.getCampaignsByResearcher(researcher1);
        assertEq(r1Campaigns.length, 2);
        assertEq(r1Campaigns[0], r1c1);
        assertEq(r1Campaigns[1], r1c2);

        // Verify researcher2's campaigns
        address[] memory r2Campaigns = factory.getCampaignsByResearcher(researcher2);
        assertEq(r2Campaigns.length, 1);
        assertEq(r2Campaigns[0], r2c1);

        // Verify researcher3 has no campaigns
        address[] memory r3Campaigns = factory.getCampaignsByResearcher(researcher3);
        assertEq(r3Campaigns.length, 0);
    }

    function test_GetCampaignDetails() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        (address researcher, uint256 fundingGoal, uint256 deadline, Campaign.CampaignState state, uint256 totalFunded) =
            factory.getCampaignDetails(campaignAddress);

        assertEq(researcher, researcher1);
        assertEq(fundingGoal, VALID_FUNDING_GOAL);
        assertEq(deadline, block.timestamp + VALID_DEADLINE);
        assertEq(uint256(state), uint256(Campaign.CampaignState.Open));
        assertEq(totalFunded, 0);
    }

    function test_IsValidCampaign() public {
        vm.prank(researcher1);
        address validCampaign = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);

        assertTrue(factory.isValidCampaign(validCampaign));
        assertFalse(factory.isValidCampaign(address(0)));
        assertFalse(factory.isValidCampaign(makeAddr("random")));
    }

    function test_GetTotalCampaigns() public {
        assertEq(factory.getTotalCampaigns(), 0);

        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        assertEq(factory.getTotalCampaigns(), 1);

        vm.prank(researcher2);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        assertEq(factory.getTotalCampaigns(), 2);

        vm.prank(researcher1);
        factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        assertEq(factory.getTotalCampaigns(), 3);
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullCampaignLifecycleViaFactory() public {
        // 1. Create campaign
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(
            VALID_FUNDING_GOAL, VALID_DEADLINE, CAMPAIGN_TITLE, CAMPAIGN_DESCRIPTION, CAMPAIGN_CATEGORY
        );

        Campaign campaign = Campaign(campaignAddress);

        // 2. Backer funds the campaign
        vm.prank(backer);
        campaign.fund{value: VALID_FUNDING_GOAL}();

        // 3. Move past deadline
        vm.warp(block.timestamp + VALID_DEADLINE + 1);

        // 4. Finalize campaign
        campaign.finalizeCampaign();
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));

        // 5. Researcher withdraws funds
        uint256 researcherBalanceBefore = researcher1.balance;
        vm.prank(researcher1);
        campaign.withdrawFunds();

        assertEq(researcher1.balance, researcherBalanceBefore + VALID_FUNDING_GOAL);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));
    }

    function test_MultipleResearchersMultipleCampaigns() public {
        // Create campaigns from different researchers
        vm.prank(researcher1);
        address r1c1 = factory.createCampaign(5 ether, 10 days, "R1 Campaign 1", "", "");

        vm.prank(researcher1);
        address r1c2 = factory.createCampaign(15 ether, 20 days, "R1 Campaign 2", "", "");

        vm.prank(researcher2);
        address r2c1 = factory.createCampaign(8 ether, 15 days, "R2 Campaign 1", "", "");

        vm.prank(researcher3);
        address r3c1 = factory.createCampaign(12 ether, 25 days, "R3 Campaign 1", "", "");

        // Verify total campaigns
        assertEq(factory.getTotalCampaigns(), 4);

        // Verify researcher campaigns
        assertEq(factory.getCampaignsByResearcher(researcher1).length, 2);
        assertEq(factory.getCampaignsByResearcher(researcher2).length, 1);
        assertEq(factory.getCampaignsByResearcher(researcher3).length, 1);

        // Verify all campaigns are valid
        assertTrue(factory.isValidCampaign(r1c1));
        assertTrue(factory.isValidCampaign(r1c2));
        assertTrue(factory.isValidCampaign(r2c1));
        assertTrue(factory.isValidCampaign(r3c1));

        // Verify metadata
        MomentumFactory.CampaignMetadata memory meta1 = factory.getCampaignMetadata(r1c1);
        assertEq(meta1.title, "R1 Campaign 1");
        assertEq(meta1.researcher, researcher1);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_CreateCampaignWithValidInputs(uint256 fundingGoal, uint256 deadline) public {
        // Bound inputs to valid ranges
        fundingGoal = bound(fundingGoal, factory.MIN_FUNDING_GOAL(), factory.MAX_FUNDING_GOAL());
        deadline = bound(deadline, factory.MIN_DEADLINE(), factory.MAX_DEADLINE());

        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(fundingGoal, deadline);

        assertTrue(campaignAddress != address(0));
        assertTrue(factory.isValidCampaign(campaignAddress));

        Campaign campaign = Campaign(campaignAddress);
        assertEq(campaign.i_fundingGoal(), fundingGoal);
    }

    function testFuzz_CreateMultipleCampaigns(uint8 numCampaigns) public {
        vm.assume(numCampaigns > 0 && numCampaigns <= 50); // Reasonable limit

        for (uint8 i = 0; i < numCampaigns; i++) {
            vm.prank(researcher1);
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        }

        assertEq(factory.getTotalCampaigns(), numCampaigns);
        assertEq(factory.getCampaignsByResearcher(researcher1).length, numCampaigns);
    }

    function testFuzz_PaginationAlwaysReturnsCorrectData(uint8 totalCampaigns, uint8 offset, uint8 limit) public {
        // Bound to reasonable values
        totalCampaigns = uint8(bound(totalCampaigns, 1, 20));
        offset = uint8(bound(offset, 0, totalCampaigns));
        limit = uint8(bound(limit, 1, 10));

        // Create campaigns
        for (uint8 i = 0; i < totalCampaigns; i++) {
            vm.prank(researcher1);
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
        }

        // Get paginated results
        address[] memory page = factory.getDeployedCampaigns(offset, limit);

        // Calculate expected length
        uint256 expectedLength;
        if (offset >= totalCampaigns) {
            expectedLength = 0;
        } else {
            uint256 remaining = totalCampaigns - offset;
            expectedLength = remaining < limit ? remaining : limit;
        }

        assertEq(page.length, expectedLength);
    }

    /*//////////////////////////////////////////////////////////////
                        EDGE CASES & STRESS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateManyResearchersManyCampaigns() public {
        // Each of 10 researchers creates 3 campaigns
        for (uint160 i = 1; i <= 10; i++) {
            address researcher = address(i);

            for (uint256 j = 0; j < 3; j++) {
                vm.prank(researcher);
                factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE);
            }

            assertEq(factory.getCampaignsByResearcher(researcher).length, 3);
        }

        assertEq(factory.getTotalCampaigns(), 30);
    }

    function test_EmptyStringMetadata() public {
        vm.prank(researcher1);
        address campaignAddress = factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, "", "", "");

        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, "");
        assertEq(metadata.description, "");
        assertEq(metadata.category, "");
    }

    function test_VeryLongMetadataStrings() public {
        string memory longTitle =
            "This is a very long title that contains many characters and could potentially cause gas issues if not handled properly in the smart contract";

        vm.prank(researcher1);
        address campaignAddress =
            factory.createCampaign(VALID_FUNDING_GOAL, VALID_DEADLINE, longTitle, "Long description", "Long category");

        MomentumFactory.CampaignMetadata memory metadata = factory.getCampaignMetadata(campaignAddress);
        assertEq(metadata.title, longTitle);
    }
}
