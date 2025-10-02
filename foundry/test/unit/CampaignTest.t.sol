// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Campaign} from "../../src/Campaign.sol";

contract CampaignTest is Test {
    Campaign public campaign;

    address public researcher = makeAddr("researcher");
    address public backer1 = makeAddr("backer1");
    address public backer2 = makeAddr("backer2");
    address public backer3 = makeAddr("backer3");

    uint256 public constant FUNDING_GOAL = 10 ether;
    uint256 public constant DEADLINE = 30 days;
    uint256 public constant STARTING_BALANCE = 100 ether;

    event CampaignFunded(address indexed funder, uint256 amount);
    event CampaignWithdrawn(address indexed researcher, uint256 amount);
    event CampaignFinalized(Campaign.CampaignState finalState);
    event Refunded(address indexed backer, uint256 amount);

    function setUp() public {
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE);

        // Give backers some ETH
        vm.deal(backer1, STARTING_BALANCE);
        vm.deal(backer2, STARTING_BALANCE);
        vm.deal(backer3, STARTING_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ConstructorSetsCorrectValues() public view {
        assertEq(campaign.i_researcher(), researcher);
        assertEq(campaign.i_fundingGoal(), FUNDING_GOAL);
        assertEq(campaign.i_deadline(), block.timestamp + DEADLINE);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Open));
    }

    /*//////////////////////////////////////////////////////////////
                            FUND TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FundSucceeds() public {
        uint256 fundAmount = 1 ether;

        vm.prank(backer1);
        campaign.fund{value: fundAmount}();

        assertEq(campaign.s_backers(backer1), fundAmount);
        assertEq(campaign.s_totalFunded(), fundAmount);
    }

    function test_FundEmitsEvent() public {
        uint256 fundAmount = 1 ether;

        vm.expectEmit(true, false, false, true);
        emit CampaignFunded(backer1, fundAmount);

        vm.prank(backer1);
        campaign.fund{value: fundAmount}();
    }

    function test_FundAccumulatesMultipleContributions() public {
        vm.prank(backer1);
        campaign.fund{value: 1 ether}();

        vm.prank(backer1);
        campaign.fund{value: 2 ether}();

        assertEq(campaign.s_backers(backer1), 3 ether);
        assertEq(campaign.s_totalFunded(), 3 ether);
    }

    function test_FundFromMultipleBackers() public {
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

    function test_FundRevertsWhenZeroValue() public {
        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__MustSendMoreThanZero.selector);
        campaign.fund{value: 0}();
    }

    function test_FundRevertsAfterDeadline() public {
        vm.warp(block.timestamp + DEADLINE + 1);

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__DeadlineHasPassed.selector);
        campaign.fund{value: 1 ether}();
    }

    function test_FundRevertsWhenNotInOpenState() public {
        // Fund the campaign to goal
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        // Move past deadline and finalize
        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        // Try to fund after finalization
        vm.prank(backer2);
        vm.expectRevert(Campaign.Campaign__NotInOpenState.selector);
        campaign.fund{value: 1 ether}();
    }

    /*//////////////////////////////////////////////////////////////
                      FINALIZE CAMPAIGN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FinalizeCampaignSuccessful() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectEmit(false, false, false, true);
        emit CampaignFinalized(Campaign.CampaignState.Successful);

        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));
    }

    function test_FinalizeCampaignFailed() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL - 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);

        vm.expectEmit(false, false, false, true);
        emit CampaignFinalized(Campaign.CampaignState.Failed);

        campaign.finalizeCampaign();

        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed));
    }

    function test_FinalizeCampaignRevertsBeforeDeadline() public {
        vm.expectRevert(Campaign.Campaign__DeadlineNotPassed.selector);
        campaign.finalizeCampaign();
    }

    function test_FinalizeCampaignRevertsIfAlreadyFinalized() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.expectRevert(Campaign.Campaign__AlreadyFinalized.selector);
        campaign.finalizeCampaign();
    }

    /*//////////////////////////////////////////////////////////////
                      WITHDRAW FUNDS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_WithdrawFundsSucceeds() public {
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
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));
    }

    function test_WithdrawFundsRevertsIfNotResearcher() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NotResearcher.selector);
        campaign.withdrawFunds();
    }

    function test_WithdrawFundsRevertsIfNotSuccessful() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL - 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        vm.expectRevert(Campaign.Campaign__NotInSuccessfulState.selector);
        campaign.withdrawFunds();
    }

    function test_WithdrawFundsCannotBeCalledTwice() public {
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

    function test_ClaimRefundSucceeds() public {
        uint256 fundAmount = 5 ether;

        vm.prank(backer1);
        campaign.fund{value: fundAmount}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 backer1BalanceBefore = backer1.balance;

        vm.expectEmit(true, false, false, true);
        emit Refunded(backer1, fundAmount);

        vm.prank(backer1);
        campaign.claimRefund();

        assertEq(backer1.balance, backer1BalanceBefore + fundAmount);
        assertEq(campaign.s_backers(backer1), 0);
    }

    function test_ClaimRefundMultipleBackers() public {
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.prank(backer2);
        campaign.fund{value: 2 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        uint256 backer1BalanceBefore = backer1.balance;
        uint256 backer2BalanceBefore = backer2.balance;

        vm.prank(backer1);
        campaign.claimRefund();

        vm.prank(backer2);
        campaign.claimRefund();

        assertEq(backer1.balance, backer1BalanceBefore + 3 ether);
        assertEq(backer2.balance, backer2BalanceBefore + 2 ether);
    }

    function test_ClaimRefundRevertsIfNotFailed() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NotInFailedState.selector);
        campaign.claimRefund();
    }

    function test_ClaimRefundRevertsIfNoFunds() public {
        vm.prank(backer1);
        campaign.fund{value: 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer2);
        vm.expectRevert(Campaign.Campaign__NoFundsToRefund.selector);
        campaign.claimRefund();
    }

    function test_ClaimRefundCannotBeCalledTwice() public {
        vm.prank(backer1);
        campaign.fund{value: 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimRefund();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__NoFundsToRefund.selector);
        campaign.claimRefund();
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_FullSuccessfulCampaignFlow() public {
        // Multiple backers fund the campaign
        vm.prank(backer1);
        campaign.fund{value: 4 ether}();

        vm.prank(backer2);
        campaign.fund{value: 3 ether}();

        vm.prank(backer3);
        campaign.fund{value: 3 ether}();

        assertEq(campaign.s_totalFunded(), 10 ether);

        // Move past deadline
        vm.warp(block.timestamp + DEADLINE + 1);

        // Finalize campaign
        campaign.finalizeCampaign();
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Successful));

        // Researcher withdraws funds
        uint256 researcherBalanceBefore = researcher.balance;
        vm.prank(researcher);
        campaign.withdrawFunds();

        assertEq(researcher.balance, researcherBalanceBefore + 10 ether);
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.PaidOut));
    }

    function test_FullFailedCampaignFlow() public {
        // Backers fund but don't reach goal
        vm.prank(backer1);
        campaign.fund{value: 4 ether}();

        vm.prank(backer2);
        campaign.fund{value: 3 ether}();

        assertEq(campaign.s_totalFunded(), 7 ether);

        // Move past deadline
        vm.warp(block.timestamp + DEADLINE + 1);

        // Finalize campaign
        campaign.finalizeCampaign();
        assertEq(uint256(campaign.s_campaignState()), uint256(Campaign.CampaignState.Failed));

        // Backers claim refunds
        uint256 backer1BalanceBefore = backer1.balance;
        uint256 backer2BalanceBefore = backer2.balance;

        vm.prank(backer1);
        campaign.claimRefund();

        vm.prank(backer2);
        campaign.claimRefund();

        assertEq(backer1.balance, backer1BalanceBefore + 4 ether);
        assertEq(backer2.balance, backer2BalanceBefore + 3 ether);
    }

    /*//////////////////////////////////////////////////////////////
                          FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_FundAcceptsAnyPositiveAmount(uint256 amount) public {
        vm.assume(amount > 0 && amount <= STARTING_BALANCE);

        vm.prank(backer1);
        campaign.fund{value: amount}();

        assertEq(campaign.s_backers(backer1), amount);
        assertEq(campaign.s_totalFunded(), amount);
    }

    function testFuzz_MultipleBackersCanFund(uint256 amount1, uint256 amount2, uint256 amount3) public {
        vm.assume(amount1 > 0 && amount1 <= STARTING_BALANCE);
        vm.assume(amount2 > 0 && amount2 <= STARTING_BALANCE);
        vm.assume(amount3 > 0 && amount3 <= STARTING_BALANCE);

        vm.prank(backer1);
        campaign.fund{value: amount1}();

        vm.prank(backer2);
        campaign.fund{value: amount2}();

        vm.prank(backer3);
        campaign.fund{value: amount3}();

        assertEq(campaign.s_totalFunded(), amount1 + amount2 + amount3);
    }
}
