const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenReward", function () {

    let TokenReward;
    let tokenReward;
    let MockERC20Factory;
    let mockToken;
    let paymentToken;
    let owner;
    let user1;
    let user2;
    
    const INITIAL_SUPPLY = ethers.parseEther("100000000");
    const REWARD_AMOUNT = ethers.parseEther("100");
    const PURCHASE_AMOUNT = ethers.parseEther("500");
    const PAYMENT_AMOUNT = ethers.parseEther("1");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockToken = await MockERC20Factory.deploy("Mock Token", "MTK");
        await mockToken.waitForDeployment();

        paymentToken = await MockERC20Factory.deploy("Payment Token", "PTK");
        await paymentToken.waitForDeployment();

        TokenReward = await ethers.getContractFactory("TokenReward");
        tokenReward = await TokenReward.deploy(await mockToken.getAddress());
        await tokenReward.waitForDeployment();

        await mockToken.mint(await tokenReward.getAddress(), INITIAL_SUPPLY);
        await paymentToken.mint(user1.address, INITIAL_SUPPLY);
    });

    describe("Constructor", function () {
        it("Should set the correct token contract address", async function () {
            expect(await tokenReward.tokenContract()).to.equal(await mockToken.getAddress());
        });
    });

    describe("distributeReward", function () {
        it("Should distribute rewards correctly", async function () {
            await expect(tokenReward.distributeReward(user1.address, REWARD_AMOUNT))
                .to.emit(tokenReward, "RewardDistributed")
                .withArgs(user1.address, REWARD_AMOUNT);

            expect(await mockToken.balanceOf(user1.address)).to.equal(REWARD_AMOUNT);
        });

        it("Should revert if insufficient reward tokens", async function () {
            const largeAmount = INITIAL_SUPPLY + 1n;
            await expect(tokenReward.distributeReward(user1.address, largeAmount))
                .to.be.revertedWith("Insufficient reward tokens");
        });
    });

    describe("buyTokensWithNativeCurrency", function () {
        it("Should allow purchasing tokens with native currency", async function () {
            const purchaseAmount = PURCHASE_AMOUNT;
            const paymentAmount = PAYMENT_AMOUNT;

            await expect(
                tokenReward
                    .connect(user1)
                    .buyTokensWithNativeCurrency(purchaseAmount, { value: paymentAmount })
            )
                .to.emit(tokenReward, "TokensPurchased")
                .withArgs(user1.address, purchaseAmount, paymentAmount);

            expect(await mockToken.balanceOf(user1.address)).to.equal(purchaseAmount);
        });

        it("Should revert if payment amount is zero", async function () {
            await expect(
                tokenReward.connect(user1).buyTokensWithNativeCurrency(PURCHASE_AMOUNT, {
                    value: 0
                })
            ).to.be.revertedWith("Payment amount must be greater than zero");
        });

        it("Should revert if purchase amount is zero", async function () {
            await expect(
                tokenReward.connect(user1).buyTokensWithNativeCurrency(0, {
                    value: PAYMENT_AMOUNT
                })
            ).to.be.revertedWith("Purchase amount must be greater than zero");
        });

        it("Should revert if insufficient tokens in contract", async function () {
            const largeAmount = INITIAL_SUPPLY + 1n;
            await expect(
                tokenReward.connect(user1).buyTokensWithNativeCurrency(largeAmount, {
                    value: PAYMENT_AMOUNT,
                })
            ).to.be.revertedWith("Insufficient reward tokens");
        });
    });

    describe("buyTokensWithOtherTokens", function () {
        beforeEach(async function () {
            //Approve tokenReward contract to spend payment tokens
            await paymentToken
                .connect(user1)
                .approve(await tokenReward.getAddress(), PAYMENT_AMOUNT);
        });

        it("Should allow purchasing tokens with other tokens", async function () {
            await expect(
                tokenReward
                    .connect(user1)
                    .buyTokensWithOtherTokens(
                        PURCHASE_AMOUNT,
                        PAYMENT_AMOUNT,
                        await paymentToken.getAddress()
                    )
            )
                .to.emit(tokenReward, "TokensPurchased")
                .withArgs(user1.address, PURCHASE_AMOUNT, PAYMENT_AMOUNT);

            expect(await mockToken.balanceOf(user1.address)).to.equal(PURCHASE_AMOUNT);
            expect(await paymentToken.balanceOf(await tokenReward.getAddress())).to.equal(PAYMENT_AMOUNT);
        });

        it("Should revert if purchase amount is zero", async function () {
            await expect(
              tokenReward
                .connect(user1)
                .buyTokensWithOtherTokens(0, PAYMENT_AMOUNT, await paymentToken.getAddress())
            ).to.be.revertedWith("Purchase amount must be greater than zero");
          });
      
          it("Should revert if payment amount is zero", async function () {
            await expect(
              tokenReward
                .connect(user1)
                .buyTokensWithOtherTokens(PURCHASE_AMOUNT, 0, await paymentToken.getAddress())
            ).to.be.revertedWith("Payment amount must be greater than zero");
          });
      
          it("Should revert if insufficient tokens in contract", async function () {
            const largeAmount = INITIAL_SUPPLY + 1n;
            await expect(
              tokenReward
                .connect(user1)
                .buyTokensWithOtherTokens(
                  largeAmount,
                  PAYMENT_AMOUNT,
                  await paymentToken.getAddress()
                )
            ).to.be.revertedWith("Insufficient reward tokens");
          });
    });
})