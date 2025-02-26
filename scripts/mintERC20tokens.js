const { ethers } = require("hardhat");
const { TOKEN_CONTRACT_ADDRESS, REWARD_CONTRACT_ADDRESS } = require("../config");

async function main() {
    const rewardContractAddress = REWARD_CONTRACT_ADDRESS;
    const tokenContractAddress = TOKEN_CONTRACT_ADDRESS;

    const MockERC20 = await ethers.getContractAt("MockERC20", tokenContractAddress);
    const mintAmount = ethers.parseEther("100000");

    const tx = await MockERC20.mint(rewardContractAddress, mintAmount);
    await tx.wait();

    console.log(`Minted ${mintAmount.toString()} tokens to: `, rewardContractAddress);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});