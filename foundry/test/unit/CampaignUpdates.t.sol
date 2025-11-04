// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Campaign} from "../../src/Campaign.sol";

contract CampaignResearchUpdateTest is Test {
    Campaign public campaign;

    address public researcher = makeAddr("researcher");
    address public backer1 = makeAddr("backer1");
    address public backer2 = makeAddr("backer2");
    address public nonResearcher = makeAddr("nonResearcher");

    uint256 public constant FUNDING_GOAL = 10 ether;
    uint256 public constant DEADLINE_SECONDS = 30 days;
    uint256 public constant FUNDING_AMOUNT = 5 ether;

    function setUp() public {
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE_SECONDS);
        vm.deal(backer1, 20 ether);
        vm.deal(backer2, 20 ether);
    }

    ///////////////////////////////
    // submitResearchUpdate Tests
    ///////////////////////////////

    function testSubmitResearchUpdateInOpenState() public {
        // Arrange
        string memory ipfsHash = "QmTest123";

        // Act
        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        // Assert
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], ipfsHash);
    }

    function testSubmitMultipleResearchUpdates() public {
        // Arrange
        string memory ipfsHash1 = "QmTest123";
        string memory ipfsHash2 = "QmTest456";
        string memory ipfsHash3 = "QmTest789";

        // Act
        vm.startPrank(researcher);
        campaign.submitResearchUpdate(ipfsHash1);
        campaign.submitResearchUpdate(ipfsHash2);
        campaign.submitResearchUpdate(ipfsHash3);
        vm.stopPrank();

        // Assert
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
        assertEq(updates[0], ipfsHash1);
        assertEq(updates[1], ipfsHash2);
        assertEq(updates[2], ipfsHash3);
    }

    function testSubmitResearchUpdateRevertsIfNotResearcher() public {
        // Arrange
        string memory ipfsHash = "QmTest123";

        // Act & Assert
        vm.prank(nonResearcher);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate(ipfsHash);
    }

    function testSubmitResearchUpdateInSuccessfulState() public {
        // Arrange - Fund campaign to success
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        // Move past deadline and finalize
        vm.warp(block.timestamp + DEADLINE_SECONDS + 1);
        campaign.finalizeCampaign();

        string memory ipfsHash = "QmSuccessUpdate";

        // Act
        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        // Assert
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], ipfsHash);
    }

    function testSubmitResearchUpdateInPaidOutState() public {
        // Arrange - Fund campaign to success and withdraw
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE_SECONDS + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        string memory ipfsHash = "QmPaidOutUpdate";

        // Act
        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        // Assert
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], ipfsHash);
    }

    function testSubmitResearchUpdateRevertsInFailedState() public {
        // Arrange - Let campaign fail
        vm.prank(backer1);
        campaign.fund{value: FUNDING_AMOUNT}(); // Less than goal

        vm.warp(block.timestamp + DEADLINE_SECONDS + 1);
        campaign.finalizeCampaign();

        string memory ipfsHash = "QmFailedUpdate";

        // Act & Assert
        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInCorrectStateForUpdate.selector);
        campaign.submitResearchUpdate(ipfsHash);
    }

    function testSubmitResearchUpdateEmitsEvent() public {
        // Arrange
        string memory ipfsHash = "QmTest123";

        // Act & Assert
        vm.prank(researcher);
        vm.expectEmit(true, false, false, true);
        emit Campaign.ResearchUpdateSubmitted(researcher, ipfsHash);
        campaign.submitResearchUpdate(ipfsHash);
    }

    function testSubmitEmptyStringUpdate() public {
        // Arrange
        string memory emptyHash = "";

        // Act
        vm.prank(researcher);
        campaign.submitResearchUpdate(emptyHash);

        // Assert
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], emptyHash);
    }

    ///////////////////////////////
    // getResearchUpdates Tests
    ///////////////////////////////

    // the test function can be restricted to view because it doesn't modify state.
    // However, in test code, we typically don't enforce view/pure restrictions.
    function testGetResearchUpdatesWhenEmpty() public {
        // Act
        string[] memory updates = campaign.getResearchUpdates();

        // Assert
        assertEq(updates.length, 0);
    }

    function testGetResearchUpdatesAfterMultipleUpdates() public {
        // Arrange
        string memory ipfsHash1 = "QmUpdate1";
        string memory ipfsHash2 = "QmUpdate2";
        string memory ipfsHash3 = "QmUpdate3";

        vm.startPrank(researcher);
        campaign.submitResearchUpdate(ipfsHash1);
        campaign.submitResearchUpdate(ipfsHash2);
        campaign.submitResearchUpdate(ipfsHash3);
        vm.stopPrank();

        // Act
        string[] memory updates = campaign.getResearchUpdates();

        // Assert
        assertEq(updates.length, 3);
        assertEq(updates[0], ipfsHash1);
        assertEq(updates[1], ipfsHash2);
        assertEq(updates[2], ipfsHash3);
    }

    function testGetResearchUpdatesCanBeCalledByAnyone() public {
        // Arrange
        string memory ipfsHash = "QmTest123";
        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        // Act - Call from different addresses
        vm.prank(backer1);
        string[] memory updates1 = campaign.getResearchUpdates();

        vm.prank(nonResearcher);
        string[] memory updates2 = campaign.getResearchUpdates();

        string[] memory updates3 = campaign.getResearchUpdates();

        // Assert
        assertEq(updates1.length, 1);
        assertEq(updates2.length, 1);
        assertEq(updates3.length, 1);
        assertEq(updates1[0], ipfsHash);
        assertEq(updates2[0], ipfsHash);
        assertEq(updates3[0], ipfsHash);
    }

    function testGetResearchUpdatesInDifferentStates() public {
        // Test in Open state
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmOpenState");
        assertEq(campaign.getResearchUpdates().length, 1);

        // Fund and finalize to Successful
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();
        vm.warp(block.timestamp + DEADLINE_SECONDS + 1);
        campaign.finalizeCampaign();

        // Test in Successful state
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmSuccessfulState");
        assertEq(campaign.getResearchUpdates().length, 2);

        // Withdraw to PaidOut state
        vm.prank(researcher);
        campaign.withdrawFunds();

        // Test in PaidOut state
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmPaidOutState");

        // Assert all updates are retrievable
        string[] memory allUpdates = campaign.getResearchUpdates();
        assertEq(allUpdates.length, 3);
        assertEq(allUpdates[0], "QmOpenState");
        assertEq(allUpdates[1], "QmSuccessfulState");
        assertEq(allUpdates[2], "QmPaidOutState");
    }

    function testGetResearchUpdatesReturnsCorrectOrder() public {
        // Arrange - Submit updates in specific order
        vm.startPrank(researcher);
        for (uint256 i = 0; i < 5; i++) {
            campaign.submitResearchUpdate(string(abi.encodePacked("QmUpdate", vm.toString(i))));
        }
        vm.stopPrank();

        // Act
        string[] memory updates = campaign.getResearchUpdates();

        // Assert - Check order is maintained
        for (uint256 i = 0; i < 5; i++) {
            assertEq(updates[i], string(abi.encodePacked("QmUpdate", vm.toString(i))));
        }
    }

    ///////////////////////////////
    // Integration Tests
    ///////////////////////////////

    function testResearchUpdateWorkflowThroughCampaignLifecycle() public {
        // Phase 1: Open state - submit initial update
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmInitialPlan");
        assertEq(campaign.getResearchUpdates().length, 1);

        // Phase 2: Receive funding
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmFundingReceived");
        assertEq(campaign.getResearchUpdates().length, 2);

        // Phase 3: Finalize to Successful
        vm.warp(block.timestamp + DEADLINE_SECONDS + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmCampaignSuccessful");
        assertEq(campaign.getResearchUpdates().length, 3);

        // Phase 4: Withdraw funds
        vm.prank(researcher);
        campaign.withdrawFunds();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmResearchInProgress");
        assertEq(campaign.getResearchUpdates().length, 4);

        // Verify all updates
        string[] memory allUpdates = campaign.getResearchUpdates();
        assertEq(allUpdates[0], "QmInitialPlan");
        assertEq(allUpdates[1], "QmFundingReceived");
        assertEq(allUpdates[2], "QmCampaignSuccessful");
        assertEq(allUpdates[3], "QmResearchInProgress");
    }
}
