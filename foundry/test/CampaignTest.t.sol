// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Campaign} from "../src/Campaign.sol";

contract CampaignTest is Test {
    Campaign public campaign;

    address public researcher = makeAddr("researcher");
    address public backer1 = makeAddr("backer1");
    address public backer2 = makeAddr("backer2");
    address public backer3 = makeAddr("backer3");

    uint256 public constant FUNDING_GOAL = 10 ether;
    uint256 public constant DEADLINE = 30 days;
    string public constant METADATA_URI = "ipfs://QmTest123";

    event CampaignFunded(address indexed funder, uint256 amount);
    event CampaignWithdrawn(address indexed researcher, uint256 amount);
    event CampaignFinalized(Campaign.CampaignState finalState);
    event Refunded(address indexed backer, uint256 amount);

    function setUp() public {
        vm.prank(researcher);
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE, METADATA_URI);

        vm.deal(backer1, 100 ether);
        vm.deal(backer2, 100 ether);
        vm.deal(backer3, 100 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Constructor_InitializesCorrectly() public view {
        assertEq(campaign.i_researcher(), researcher);
        assertEq(campaign.i_fundingGoal(), FUNDING_GOAL);
        assertEq(campaign.i_deadline(), block.timestamp + DEADLINE);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Open));
        assertEq(campaign.s_totalFunded(), 0);
    }

    /*//////////////////////////////////////////////////////////////
                        FUND TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Fund_Success() public {
        uint256 fundAmount = 1 ether;

        vm.expectEmit(true, false, false, true);
        emit CampaignFunded(backer1, fundAmount);

        vm.prank(backer1);
        campaign.fund{value: fundAmount}();

        assertEq(campaign.s_backers(backer1), fundAmount);
        assertEq(campaign.s_totalFunded(), fundAmount);
        assertEq(address(campaign).balance, fundAmount);
    }

    function test_Fund_MultipleBackers() public {
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.prank(backer2);
        campaign.fund{value: 5 ether}();

        vm.prank(backer3);
        campaign.fund{value: 2 ether}();

        assertEq(campaign.s_backers(backer1), 3 ether);
        assertEq(campaign.s_backers(backer2), 5 ether);
        assertEq(campaign.s_backers(backer3), 2 ether);
        assertEq(campaign.s_totalFunded(), 10 ether);
    }

    function test_Fund_SameBackerMultipleTimes() public {
        vm.startPrank(backer1);
        campaign.fund{value: 1 ether}();
        campaign.fund{value: 2 ether}();
        campaign.fund{value: 3 ether}();
        vm.stopPrank();

        assertEq(campaign.s_backers(backer1), 6 ether);
        assertEq(campaign.s_totalFunded(), 6 ether);
    }

    function test_Fund_RevertsIfZeroAmount() public {
        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__MustSendMoreThanZero.selector);
        campaign.fund{value: 0}();
    }

    function test_Fund_RevertsAfterDeadline() public {
        vm.warp(block.timestamp + DEADLINE + 1);

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__DeadlineHasPassed.selector);
        campaign.fund{value: 1 ether}();
    }

    function test_Fund_RevertsIfNotInOpenState() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer2);
        vm.expectRevert(Campaign.Campaign__NotInOpenState.selector);
        campaign.fund{value: 1 ether}();
    }

    /*//////////////////////////////////////////////////////////////
                    FINALIZE CAMPAIGN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FinalizeCampaign_SuccessfulWhenGoalMet() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectEmit(false, false, false, true);
        emit CampaignFinalized(Campaign.CampaignState.Successful);

        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));
    }

    function test_FinalizeCampaign_SuccessfulWhenGoalExceeded() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL + 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));
    }

    function test_FinalizeCampaign_FailedWhenGoalNotMet() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL - 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectEmit(false, false, false, true);
        emit CampaignFinalized(Campaign.CampaignState.Failed);

        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed));
    }

    function test_FinalizeCampaign_RevertsBeforeDeadline() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.expectRevert(Campaign.Campaign__DeadlineNotPassed.selector);
        campaign.finalizeCampaign();
    }

    function test_FinalizeCampaign_RevertsIfAlreadyFinalized() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.expectRevert(Campaign.Campaign__AlreadyFinalized.selector);
        campaign.finalizeCampaign();
    }

    function test_FinalizeCampaign_CanBeCalledByAnyone() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.prank(backer2);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));
    }

    /*//////////////////////////////////////////////////////////////
                    WITHDRAW FUNDS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_WithdrawFunds_Success() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 researcherBalanceBefore = researcher.balance;

        vm.expectEmit(true, false, false, true);
        emit CampaignWithdrawn(researcher, FUNDING_GOAL);

        vm.prank(researcher);
        campaign.withdrawFunds();

        assertEq(researcher.balance, researcherBalanceBefore + FUNDING_GOAL);
        assertEq(address(campaign).balance, 0);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));
    }

    function test_WithdrawFunds_RevertsIfNotResearcher() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.withdrawFunds();
    }

    function test_WithdrawFunds_RevertsIfNotSuccessful() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL - 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInSuccessfulState.selector);
        campaign.withdrawFunds();
    }

    function test_WithdrawFunds_RevertsIfAlreadyPaidOut() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInSuccessfulState.selector);
        campaign.withdrawFunds();
    }

    /*//////////////////////////////////////////////////////////////
                    CLAIM REFUND TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ClaimRefund_Success() public {
        uint256 fundAmount = 3 ether;

        vm.prank(backer1);
        campaign.fund{value: fundAmount}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 balanceBefore = backer1.balance;

        vm.expectEmit(true, false, false, true);
        emit Refunded(backer1, fundAmount);

        vm.prank(backer1);
        campaign.claimRefund();

        assertEq(backer1.balance, balanceBefore + fundAmount);
        assertEq(campaign.s_backers(backer1), 0);
    }

    function test_ClaimRefund_MultipleBackers() public {
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.prank(backer2);
        campaign.fund{value: 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 backer1BalanceBefore = backer1.balance;
        uint256 backer2BalanceBefore = backer2.balance;

        vm.prank(backer1);
        campaign.claimRefund();

        vm.prank(backer2);
        campaign.claimRefund();

        assertEq(backer1.balance, backer1BalanceBefore + 3 ether);
        assertEq(backer2.balance, backer2BalanceBefore + 5 ether);
    }

    function test_ClaimRefund_RevertsIfNotFailed() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NotInFailedState.selector);
        campaign.claimRefund();
    }

    function test_ClaimRefund_RevertsIfNoFundsToRefund() public {
        vm.prank(backer1);
        campaign.fund{value: 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer2);
        vm.expectRevert(Campaign.Campaign__NoFundsToRefund.selector);
        campaign.claimRefund();
    }

    function test_ClaimRefund_RevertsIfAlreadyClaimed() public {
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.startPrank(backer1);
        campaign.claimRefund();

        vm.expectRevert(Campaign.Campaign__NoFundsToRefund.selector);
        campaign.claimRefund();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullCampaignFlow_Successful() public {
        vm.prank(backer1);
        campaign.fund{value: 4 ether}();

        vm.prank(backer2);
        campaign.fund{value: 6 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));

        vm.prank(researcher);
        campaign.withdrawFunds();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));
    }

    function test_FullCampaignFlow_Failed() public {
        vm.prank(backer1);
        campaign.fund{value: 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed));

        vm.prank(backer1);
        campaign.claimRefund();

        assertEq(campaign.s_backers(backer1), 0);
        assertEq(address(campaign).balance, 0);
    }

    /*//////////////////////////////////////////////////////////////
                    FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_Fund_ValidAmount(uint256 amount) public {
        amount = bound(amount, 0.01 ether, 100 ether);

        vm.prank(backer1);
        campaign.fund{value: amount}();

        assertEq(campaign.s_backers(backer1), amount);
        assertEq(campaign.s_totalFunded(), amount);
    }

    function testFuzz_Fund_MultipleBackers(uint256 amount1, uint256 amount2, uint256 amount3) public {
        amount1 = bound(amount1, 0.01 ether, 30 ether);
        amount2 = bound(amount2, 0.01 ether, 30 ether);
        amount3 = bound(amount3, 0.01 ether, 30 ether);

        vm.prank(backer1);
        campaign.fund{value: amount1}();

        vm.prank(backer2);
        campaign.fund{value: amount2}();

        vm.prank(backer3);
        campaign.fund{value: amount3}();

        assertEq(campaign.s_totalFunded(), amount1 + amount2 + amount3);
    }

    function testFuzz_ClaimRefund_AfterFailed(uint256 amount) public {
        amount = bound(amount, 0.01 ether, FUNDING_GOAL - 1);

        vm.prank(backer1);
        campaign.fund{value: amount}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 balanceBefore = backer1.balance;

        vm.prank(backer1);
        campaign.claimRefund();

        assertEq(backer1.balance, balanceBefore + amount);
    }
}
