pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenReward is ReentrancyGuard, Ownable {

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

    constructor(address _tokenContract) Ownable(msg.sender) {
        tokenContract = IERC20(_tokenContract);
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0), "Not valid address");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than zero");
        _;
    }

    function distributeReward(address user, uint256 gameTokenAmount)
        external
        onlyOwner
        validAddress(user)
        validAmount(gameTokenAmount)
    {
        require(tokenContract.balanceOf(address(this)) >= gameTokenAmount, "Insufficient reward tokens");
        tokenContract.transfer(user, gameTokenAmount);
        emit RewardDistributed(user, gameTokenAmount);
    }

    function buyTokensWithNativeCurrency(uint256 gameTokenAmount)
        external
        payable
        validAmount(msg.value)
        validAmount(gameTokenAmount)
    {
        require(tokenContract.balanceOf(address(this)) >= gameTokenAmount, "Insufficient reward tokens");
        tokenContract.transfer(msg.sender, gameTokenAmount);
        emit TokensPurchased(msg.sender, gameTokenAmount, msg.value);
    }

    function buyTokensWithOtherTokens(uint256 gameTokenAmount, uint256 paymentTokenAmount, address paymentTokenAddress)
        external
        payable
        validAmount(gameTokenAmount)
        validAmount(paymentTokenAmount)
    {
        require(tokenContract.balanceOf(address(this)) >= gameTokenAmount, "Insufficient reward tokens");
        IERC20 otherTokenContract = IERC20(paymentTokenAddress);
        otherTokenContract.transferFrom(msg.sender, address(this), paymentTokenAmount);
        tokenContract.transfer(msg.sender, gameTokenAmount);
        emit TokensPurchased(msg.sender, gameTokenAmount, paymentTokenAmount);
    }

}