// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Campaign} from "../src/Campaign.sol";

/**
 * @title CampaignResearchUpdateTest
 * @notice Comprehensive tests for research update functionality
 */
contract CampaignResearchUpdateTest is Test {
    Campaign public campaign;

    address public researcher = makeAddr("researcher");
    address public backer1 = makeAddr("backer1");
    address public backer2 = makeAddr("backer2");
    address public nonResearcher = makeAddr("nonResearcher");
    address public randomUser = makeAddr("randomUser");

    uint256 public constant FUNDING_GOAL = 10 ether;
    uint256 public constant DEADLINE = 30 days;
    string public constant METADATA_URI = "ipfs://QmTest123";

    event ResearchUpdateSubmitted(address indexed researcher, string ipfsHash);

    function setUp() public {
        vm.prank(researcher);
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE, METADATA_URI);

        vm.deal(backer1, 100 ether);
        vm.deal(backer2, 100 ether);
    }

    /*//////////////////////////////////////////////////////////////
                SUBMIT RESEARCH UPDATE - BASIC TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SubmitResearchUpdate_Success() public {
        string memory ipfsHash = "QmUpdate1";

        vm.expectEmit(true, false, false, true);
        emit ResearchUpdateSubmitted(researcher, ipfsHash);

        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], ipfsHash);
    }

    function test_SubmitResearchUpdate_SingleUpdate() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmFirstUpdate");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], "QmFirstUpdate");
    }

    function test_SubmitResearchUpdate_TwoUpdates() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");
        campaign.submitResearchUpdate("QmUpdate2");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 2);
        assertEq(updates[0], "QmUpdate1");
        assertEq(updates[1], "QmUpdate2");
    }

    function test_SubmitResearchUpdate_MultipleUpdates() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");
        campaign.submitResearchUpdate("QmUpdate2");
        campaign.submitResearchUpdate("QmUpdate3");
        campaign.submitResearchUpdate("QmUpdate4");
        campaign.submitResearchUpdate("QmUpdate5");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 5);
        assertEq(updates[0], "QmUpdate1");
        assertEq(updates[1], "QmUpdate2");
        assertEq(updates[2], "QmUpdate3");
        assertEq(updates[3], "QmUpdate4");
        assertEq(updates[4], "QmUpdate5");
    }

    function test_SubmitResearchUpdate_TenUpdates() public {
        vm.startPrank(researcher);
        for (uint256 i = 1; i <= 10; i++) {
            campaign.submitResearchUpdate(string(abi.encodePacked("QmUpdate", vm.toString(i))));
        }
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 10);
    }

    function test_SubmitResearchUpdate_EmptyString() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], "");
    }

    function test_SubmitResearchUpdate_LongIPFSHash() public {
        string memory longHash =
            "QmYwAPJzv5CZsnAzt8auVZRnRvhNZaM6cA7tZjBdZYGaMxQmYwAPJzv5CZsnAzt8auVZRnRvhNZaM6cA7tZjBdZYGaMx";

        vm.prank(researcher);
        campaign.submitResearchUpdate(longHash);

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], longHash);
    }

    function test_SubmitResearchUpdate_DifferentIPFSFormats() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmHash1");
        campaign.submitResearchUpdate("ipfs://QmHash2");
        campaign.submitResearchUpdate("bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
    }

    /*//////////////////////////////////////////////////////////////
            SUBMIT RESEARCH UPDATE - ACCESS CONTROL TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SubmitResearchUpdate_RevertsIfNotResearcher() public {
        vm.prank(nonResearcher);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate1");
    }

    function test_SubmitResearchUpdate_BackerCannotSubmit() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate1");
    }

    function test_SubmitResearchUpdate_RandomUserCannotSubmit() public {
        vm.prank(randomUser);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate1");
    }

    function test_SubmitResearchUpdate_MultipleUsersCannotSubmit() public {
        address user1 = makeAddr("user1");
        address user2 = makeAddr("user2");
        address user3 = makeAddr("user3");

        vm.prank(user1);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate1");

        vm.prank(user2);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate2");

        vm.prank(user3);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate("QmUpdate3");
    }

    /*//////////////////////////////////////////////////////////////
            SUBMIT RESEARCH UPDATE - STATE-BASED TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SubmitResearchUpdate_AllowedInOpenState() public {
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Open));

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_MultipleInOpenState() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmOpen1");
        campaign.submitResearchUpdate("QmOpen2");
        campaign.submitResearchUpdate("QmOpen3");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
    }

    function test_SubmitResearchUpdate_AllowedInSuccessfulState() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmSuccessUpdate");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_MultipleInSuccessfulState() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmSuccess1");
        campaign.submitResearchUpdate("QmSuccess2");
        campaign.submitResearchUpdate("QmSuccess3");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
    }

    function test_SubmitResearchUpdate_AllowedInPaidOutState() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmPaidOutUpdate");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_MultipleInPaidOutState() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmPaidOut1");
        campaign.submitResearchUpdate("QmPaidOut2");
        campaign.submitResearchUpdate("QmPaidOut3");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
    }

    function test_SubmitResearchUpdate_RevertsInFailedState() public {
        vm.prank(backer1);
        campaign.fund{value: 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed));

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInCorrectStateForUpdate.selector);
        campaign.submitResearchUpdate("QmFailedUpdate");
    }

    function test_SubmitResearchUpdate_CannotSubmitAfterFailure() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL - 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInCorrectStateForUpdate.selector);
        campaign.submitResearchUpdate("QmUpdate1");
    }

    /*//////////////////////////////////////////////////////////////
        SUBMIT RESEARCH UPDATE - INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SubmitResearchUpdate_ThroughoutCampaignLifecycle() public {
        // Update during open state
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmProgress1");

        // Fund campaign
        vm.prank(backer1);
        campaign.fund{value: 5 ether}();

        // Another update in open state
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmProgress2");

        // More funding
        vm.prank(backer2);
        campaign.fund{value: 5 ether}();

        // Update before finalization
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmProgress3");

        // Finalize
        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        // Update after successful
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmResults1");

        // Withdraw funds
        vm.prank(researcher);
        campaign.withdrawFunds();

        // Final updates after paid out
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmFinalReport1");
        campaign.submitResearchUpdate("QmFinalReport2");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 6);
        assertEq(updates[0], "QmProgress1");
        assertEq(updates[1], "QmProgress2");
        assertEq(updates[2], "QmProgress3");
        assertEq(updates[3], "QmResults1");
        assertEq(updates[4], "QmFinalReport1");
        assertEq(updates[5], "QmFinalReport2");
    }

    function test_SubmitResearchUpdate_BeforeAndAfterFunding() public {
        // Before any funding
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmInitialPlan");

        // After partial funding
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmProgress1");

        // After more funding
        vm.prank(backer2);
        campaign.fund{value: 7 ether}();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmProgress2");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
    }

    function test_SubmitResearchUpdate_AfterNFTClaims() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmAfterNFT");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_MultipleUpdatesInEachState() public {
        // Open state updates
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmOpen1");
        campaign.submitResearchUpdate("QmOpen2");
        vm.stopPrank();

        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        // Successful state updates
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmSuccess1");
        campaign.submitResearchUpdate("QmSuccess2");
        campaign.submitResearchUpdate("QmSuccess3");
        vm.stopPrank();

        vm.prank(researcher);
        campaign.withdrawFunds();

        // PaidOut state updates
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmPaidOut1");
        campaign.submitResearchUpdate("QmPaidOut2");
        campaign.submitResearchUpdate("QmPaidOut3");
        campaign.submitResearchUpdate("QmPaidOut4");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 9);
    }

    /*//////////////////////////////////////////////////////////////
                GET RESEARCH UPDATES TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetResearchUpdates_EmptyArrayInitially() public view {
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 0);
    }

    function test_GetResearchUpdates_ReturnsAllUpdates() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");
        campaign.submitResearchUpdate("QmUpdate2");
        campaign.submitResearchUpdate("QmUpdate3");
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 3);
        assertEq(updates[0], "QmUpdate1");
        assertEq(updates[1], "QmUpdate2");
        assertEq(updates[2], "QmUpdate3");
    }

    function test_GetResearchUpdates_CanBeCalledByResearcher() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");

        vm.prank(researcher);
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_GetResearchUpdates_CanBeCalledByBacker() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");

        vm.prank(backer1);
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], "QmUpdate1");
    }

    function test_GetResearchUpdates_CanBeCalledByAnyone() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");

        vm.prank(randomUser);
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_GetResearchUpdates_MultipleCallsReturnSameData() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmUpdate1");

        string[] memory updates1 = campaign.getResearchUpdates();
        string[] memory updates2 = campaign.getResearchUpdates();
        string[] memory updates3 = campaign.getResearchUpdates();

        assertEq(updates1.length, updates2.length);
        assertEq(updates2.length, updates3.length);
        assertEq(updates1[0], updates2[0]);
        assertEq(updates2[0], updates3[0]);
    }

    function test_GetResearchUpdates_AfterMultipleUpdates() public {
        vm.startPrank(researcher);
        for (uint256 i = 1; i <= 15; i++) {
            campaign.submitResearchUpdate(string(abi.encodePacked("QmUpdate", vm.toString(i))));
        }
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 15);
    }

    /*//////////////////////////////////////////////////////////////
                RESEARCH UPDATE - EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function test_SubmitResearchUpdate_ImmediatelyAfterDeployment() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmVeryEarly");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_JustBeforeDeadline() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        // One second before deadline
        vm.warp(block.timestamp + DEADLINE - 1);

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmLastMinute");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_JustAfterFinalization() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        // Immediately after finalization
        vm.prank(researcher);
        campaign.submitResearchUpdate("QmJustFinalized");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    function test_SubmitResearchUpdate_LongAfterPaidOut() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        // Long time after paid out (1 year)
        vm.warp(block.timestamp + 365 days);

        vm.prank(researcher);
        campaign.submitResearchUpdate("QmLongAfter");

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
    }

    /*//////////////////////////////////////////////////////////////
                FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_SubmitResearchUpdate_MultipleUpdates(uint8 updateCount) public {
        updateCount = uint8(bound(updateCount, 1, 50));

        vm.startPrank(researcher);
        for (uint256 i = 0; i < updateCount; i++) {
            campaign.submitResearchUpdate(string(abi.encodePacked("QmUpdate", vm.toString(i))));
        }
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, updateCount);
    }

    function testFuzz_SubmitResearchUpdate_DifferentStrings(string memory ipfsHash) public {
        vm.assume(bytes(ipfsHash).length > 0);
        vm.assume(bytes(ipfsHash).length < 200);

        vm.prank(researcher);
        campaign.submitResearchUpdate(ipfsHash);

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1);
        assertEq(updates[0], ipfsHash);
    }
}
