// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {Campaign} from "../../src/Campaign.sol";

/**
 * @title CampaignUpdatesTest
 * @notice Research update 기능 테스트
 */
contract CampaignUpdatesTest is Test {
    Campaign internal campaign;
    address internal researcher = makeAddr("researcher");
    address internal backer = makeAddr("backer");
    address internal randomUser = makeAddr("randomUser");

    uint256 internal constant FUNDING_GOAL = 10 ether;
    uint256 internal constant DEADLINE_SECONDS = 7 days;
    string internal constant TEST_HASH_1 = "QmXyZ...FirstUpdate";
    string internal constant TEST_HASH_2 = "QmAbC...SecondUpdate";

    function setUp() public {
        vm.prank(researcher);
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE_SECONDS);
    }

    // ========== Helper Functions ==========

    function _fundCampaign() internal {
        vm.prank(backer);
        campaign.fund{value: FUNDING_GOAL}();
    }

    function _warpToAfterDeadline() internal {
        vm.warp(block.timestamp + DEADLINE_SECONDS + 1 days);
    }

    function _finalizeCampaignToSuccessful() internal {
        _fundCampaign();
        _warpToAfterDeadline();
        campaign.finalizeCampaign();
        assertEq(
            uint256(campaign.s_campaignState()),
            uint256(Campaign.CampaignState.Successful),
            "Campaign should be Successful"
        );
    }

    function _finalizeCampaignToFailed() internal {
        _warpToAfterDeadline();
        campaign.finalizeCampaign();
        assertEq(
            uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed), "Campaign should be Failed"
        );
    }

    function _assertUpdateStored(string memory expectedHash, uint256 index) internal {
        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates[index], expectedHash, "Update hash mismatch");
    }

    // ========== Success Tests ==========

    function test_Success_SubmitResearchUpdate() public {
        vm.prank(researcher);
        campaign.submitResearchUpdate(TEST_HASH_1);

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 1, "Should have 1 update");
        assertEq(updates[0], TEST_HASH_1, "Hash mismatch");
    }

    function test_Success_SubmitUpdate_WhenStateIsSuccessful() public {
        _finalizeCampaignToSuccessful();

        vm.prank(researcher);
        campaign.submitResearchUpdate(TEST_HASH_1);

        _assertUpdateStored(TEST_HASH_1, 0);
    }

    function test_Success_GetResearchUpdates_Multiple() public {
        vm.startPrank(researcher);
        campaign.submitResearchUpdate(TEST_HASH_1);
        campaign.submitResearchUpdate(TEST_HASH_2);
        vm.stopPrank();

        string[] memory updates = campaign.getResearchUpdates();
        assertEq(updates.length, 2, "Should have 2 updates");
        assertEq(updates[0], TEST_HASH_1, "First hash mismatch");
        assertEq(updates[1], TEST_HASH_2, "Second hash mismatch");
    }

    // ========== Failure Tests ==========

    function test_Fail_SubmitUpdate_NotResearcher() public {
        vm.prank(randomUser);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.submitResearchUpdate(TEST_HASH_1);
    }

    function test_Fail_SubmitUpdate_WhenStateIsFailed() public {
        _finalizeCampaignToFailed();

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInCorrectStateForUpdate.selector);
        campaign.submitResearchUpdate(TEST_HASH_1);
    }
}
