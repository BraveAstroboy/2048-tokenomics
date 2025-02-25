const { ethers } = require("hardhat");
const { MOCK_TOKEN_ADDRESS, TOKEN_REWARD_ADDRESS } = require("../config");

async function main() {
    const tokenRewardAddress = TOKEN_REWARD_ADDRESS;
    const mockTokenAddress = MOCK_TOKEN_ADDRESS;

    const MockERC20 = await ethers.getContractAt("MockERC20", mockTokenAddress);
    const mintAmount = ethers.parseEther("100000");

    const tx = await MockERC20.mint(tokenRewardAddress, mintAmount);
    await tx.wait();

    console.log(`Minted ${mintAmount.toString()} tokens to: `, tokenRewardAddress);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});