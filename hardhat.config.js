require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//Load environment variables
const FUSE_RPC_URL = process.env.FUSE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FUSESCAN_API_KEY = process.env.FUSESCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    fuse: {
      url: FUSE_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 122,
      gasPrice: 'auto',
      // Recommended settings for fuse testnet
      timeout: 120000, // 2 minutes
      confirmations: 2, // Wait for 2 confirmations
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: {
      fuse: FUSESCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPriceApi: "https://owlracle.info/fuse"
  }
};
