require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

//Load environment variables
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

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
    polygon: {
      url: POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: "auto",
      // Recommended settings for Polygon mainnet
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
      polygon: POLYGONSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  }
};
