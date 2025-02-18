pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Tokenomics is ReentrancyGuard {

    IERC20 public tokenContract;

    event RewardDistributed(
        address indexed user,
        uint256 rewardAmount
    );

    event TokensPurchased(
        address indexed user,
        uint256 tokenAmount,
        uint256 paymentAmount
    );

    constructor(address _tokenContract) {
        tokenContract = IERC20(_tokenContract);
    }

    function distributeReward(address user, uint256 amount) external {
        require(tokenContract.balanceOf(address(this)) >= amount, "Insufficient reward tokens");
        tokenContract.transfer(user, amount);
        emit RewardDistributed(user, amount);
    }

    function buyTokensWithNativeCurrency(uint256 tokenAmount) external payable {
        require(msg.value > 0, "Payment amount must be greater than zero");
        require(tokenAmount > 0, "Purchase amount must be greater than zero");
        require(tokenContract.balanceOf(address(this)) >= tokenAmount, "Insufficient reward tokens");
        tokenContract.transfer(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    function buyTokensWithOtherTokens(uint256 tokenAmount, uint256 paymentTokenAmount, address paymentTokenAddress) external payable {
        require(tokenAmount > 0, "Purchase amount must be greater than zero");
        require(paymentTokenAmount > 0, "Payment amount must be greater than zero");
        require(tokenContract.balanceOf(address(this)) >= tokenAmount, "Insufficient reward tokens");
        IERC20 otherToken = IERC20(paymentTokenAddress);
        otherToken.transferFrom(msg.sender, address(this), paymentTokenAmount);
        tokenContract.transfer(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, paymentTokenAmount);
    }

}