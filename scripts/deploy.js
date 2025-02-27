const { ethers, artifacts } = require("hardhat");

async function deployWithRetry(contractName, args = [], maxAttempts = 3, delayMs = 5000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempting to deploy ${contractName} (Attempt ${attempt}/${maxAttempts})`);

            const Contract = await ethers.getContractFactory(contractName);
            const contract = await Contract.deploy(...args);
            await contract.waitForDeployment();

            const address = await contract.getAddress();
            console.log(`${contractName} deployed successfully to: ${address}`);

            //Verify the contract has been deployed
            const code = await ethers.provider.getCode(address);
            if (code === "0x") {
                throw new Error("Contract deployment failed - no code at address");
            }
            
            return contract;
        } catch (error) {
            console.log(`Deployment attempt ${attempt} failed:`, error.message);
            lastError = error;

            if (attempt < maxAttempts) {
                console.log(`Waiting ${delayMs/1000} seconds before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw new Error(`Failed to deploy ${contractName} after ${maxAttempts} attempts. Last error: ${lastError.message}`);
}

async function verifyContract(address, args = []) {
    try {
        console.log("Verifying contract...");
        await run("verify:verify", {
            address: address,
            constructorArguments: args,
        });
        console.log("Contract verified successfully");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("Contract already verified");
        } else {
            console.log("Error verifying contract: ", error);
        }
    }
}

async function main() {
    try {
        const [deployer] = await ethers.getSigners();
        console.log(deployer.address);
        console.log("Starting deployment...");

        //Deploy MockERC20 first (if needed for testing on mainnet)
        const mockToken = await deployWithRetry("MockERC20", ["Mock Token", "MTK"]);
        const mockTokenAddress = await mockToken.getAddress();

        //Deploy TokenReward with retry mechanism
        const tokenReward = await deployWithRetry("TokenReward", [mockTokenAddress]);
        const tokenRewardAddress = await tokenReward.getAddress();

        //Update frontend contract addresses
        updateContractAddress("../2048-center-backend/src/consts/contracts/token.contract.json", "../2048-frontend/src/contracts/token.contract.json", "MockERC20", mockTokenAddress, "TOKEN", "./config/token.address.js");
        updateContractAddress("../2048-center-backend/src/consts/contracts/reward.contract.json", "../2048-frontend/src/contracts/reward.contract.json", "TokenReward", tokenRewardAddress, "REWARD", "./config/reward.address.js");

        //Verify contracts on fusescan
        if (process.env.FUSESCAN_API_KEY) {
            //Wait for a few block confirmations before verification
            console.log("Waiting for block confirmations...");
            await ethers.provider.waitForTransaction(tokenReward.deployTransaction.hash, 5);

            await verifyContract(mockTokenAddress, ["Mock Token", "MTK"]);
            await verifyContract(tokenRewardAddress, [mockTokenAddress]);
        }
    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

function updateContractAddress(backendPath, frontendPath, contractName, contractAddress, name, configPath) {
    const fs = require("fs");
    const contractArtifact = artifacts.readArtifactSync(contractName);
    const contractData = {
        address: contractAddress,
        abi: contractArtifact.abi
    }
    fs.writeFileSync(backendPath, JSON.stringify(contractData, null, 2));
    fs.writeFileSync(frontendPath, JSON.stringify(contractData, null, 2));
    const configData = `const ${name}_CONTRACT_ADDRESS = "${contractAddress}";\nmodule.exports = ${name}_CONTRACT_ADDRESS;`
    fs.writeFileSync(configPath, configData, "utf-8");
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});