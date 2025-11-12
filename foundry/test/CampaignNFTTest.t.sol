// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Campaign} from "../src/Campaign.sol";

contract CampaignNFTTest is Test {
    Campaign public campaign;

    address public researcher = makeAddr("researcher");
    address public backer1 = makeAddr("backer1");
    address public backer2 = makeAddr("backer2");
    address public backer3 = makeAddr("backer3");

    uint256 public constant FUNDING_GOAL = 10 ether;
    uint256 public constant DEADLINE = 30 days;
    string public constant METADATA_URI = "ipfs://QmTest123";

    event NftClaimed(address indexed backer, uint256 tokenId);

    function setUp() public {
        vm.prank(researcher);
        campaign = new Campaign(researcher, FUNDING_GOAL, DEADLINE, METADATA_URI);

        vm.deal(backer1, 100 ether);
        vm.deal(backer2, 100 ether);
        vm.deal(backer3, 100 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        NFT METADATA TESTS
    //////////////////////////////////////////////////////////////*/

    function test_NFT_Constructor_SetsCorrectMetadata() public view {
        assertEq(campaign.name(), "MomentumPatronageNFT");
        assertEq(campaign.symbol(), "MOMP");
    }

    /*//////////////////////////////////////////////////////////////
                    CLAIM NFT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ClaimNft_Success() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.expectEmit(true, false, false, true);
        emit NftClaimed(backer1, 0);

        vm.prank(backer1);
        campaign.claimNft();

        assertEq(campaign.ownerOf(0), backer1);
        assertTrue(campaign.s_hasClaimedNFT(backer1));
        assertEq(campaign.balanceOf(backer1), 1);
    }

    function test_ClaimNft_MultipleBackersGetSequentialTokenIds() public {
        vm.prank(backer1);
        campaign.fund{value: 5 ether}();

        vm.prank(backer2);
        campaign.fund{value: 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(backer2);
        campaign.claimNft();

        assertEq(campaign.ownerOf(0), backer1);
        assertEq(campaign.ownerOf(1), backer2);
        assertEq(campaign.balanceOf(backer1), 1);
        assertEq(campaign.balanceOf(backer2), 1);
    }

    function test_ClaimNft_ThreeBackers() public {
        vm.prank(backer1);
        campaign.fund{value: 3 ether}();

        vm.prank(backer2);
        campaign.fund{value: 4 ether}();

        vm.prank(backer3);
        campaign.fund{value: 3 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(backer2);
        campaign.claimNft();

        vm.prank(backer3);
        campaign.claimNft();

        assertEq(campaign.ownerOf(0), backer1);
        assertEq(campaign.ownerOf(1), backer2);
        assertEq(campaign.ownerOf(2), backer3);
    }

    function test_ClaimNft_RevertsIfNotSuccessful() public {
        vm.prank(backer1);
        campaign.fund{value: 1 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        vm.expectRevert(Campaign.Campaign__CampaignNotSuccessful.selector);
        campaign.claimNft();
    }

    function test_ClaimNft_RevertsIfNotABacker() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer2);
        vm.expectRevert(Campaign.Campaign__NotABacker.selector);
        campaign.claimNft();
    }

    function test_ClaimNft_RevertsIfAlreadyClaimed() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.startPrank(backer1);
        campaign.claimNft();

        vm.expectRevert(Campaign.Campaign__AlreadyClaimedNFT.selector);
        campaign.claimNft();
        vm.stopPrank();
    }

    function test_ClaimNft_CanClaimAfterWithdrawal() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(researcher);
        campaign.withdrawFunds();

        vm.prank(backer1);
        campaign.claimNft();

        assertEq(campaign.ownerOf(0), backer1);
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN URI TESTS
    //////////////////////////////////////////////////////////////*/

    function test_TokenURI_ReturnsCorrectURI() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        assertEq(campaign.tokenURI(0), METADATA_URI);
    }

    function test_TokenURI_SameForAllTokens() public {
        vm.prank(backer1);
        campaign.fund{value: 5 ether}();

        vm.prank(backer2);
        campaign.fund{value: 5 ether}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(backer2);
        campaign.claimNft();

        assertEq(campaign.tokenURI(0), METADATA_URI);
        assertEq(campaign.tokenURI(1), METADATA_URI);
    }

    function test_TokenURI_RevertsForInvalidTokenId() public {
        vm.expectRevert(Campaign.Campaign__InvalidTokenId.selector);
        campaign.tokenURI(0);
    }

    function test_TokenURI_RevertsForNonExistentToken() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.expectRevert(Campaign.Campaign__InvalidTokenId.selector);
        campaign.tokenURI(1);
    }

    /*//////////////////////////////////////////////////////////////
                        NFT TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_NFT_CanBeTransferred() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(backer1);
        campaign.transferFrom(backer1, backer2, 0);

        assertEq(campaign.ownerOf(0), backer2);
        assertEq(campaign.balanceOf(backer1), 0);
        assertEq(campaign.balanceOf(backer2), 1);
    }

    function test_NFT_CanBeApproved() public {
        vm.prank(backer1);
        campaign.fund{value: FUNDING_GOAL}();

        vm.warp(block.timestamp + DEADLINE + 1);
        campaign.finalizeCampaign();

        vm.prank(backer1);
        campaign.claimNft();

        vm.prank(backer1);
        campaign.approve(backer2, 0);

        assertEq(campaign.getApproved(0), backer2);
    }
}
