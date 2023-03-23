const ethers = require("ethers");

const INFURA_API = ""; // I used infura, insert your own API key here
const CLAIM_CONTRACT_ADDRESS = ""; // Insert the address of the contract here
const TARGET_BLOCK_NUMBER = 16890400; // replace with the block number when the claim period starts
const DESTINATION_ADDRESS = ""; 
const PRIVATE_KEY = "";
const YOUR_ADDRESS = "";


const providerArbi = new ethers.InfuraProvider("arbitrum", [INFURA_API]); 
const providerMainnet = new ethers.InfuraProvider("homestead", [INFURA_API]); // this was the chain where countdown happened,
                                                                              // most of the projects counts down on 
                                                                              // the mainnet blocks

const wallet = new ethers.Wallet(PRIVATE_KEY, providerArbi);

// ABI for the claim function of the contract 
const claimAbi = [
  {
    constant: false,
    inputs: [],
    name: "claim",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const claimContract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, claimAbi, wallet);

async function waitForBlockNumber() {
    let blockNumber = await providerMainnet.getBlockNumber();
    let timeoutDelay = 10000;
    while (blockNumber < TARGET_BLOCK_NUMBER) {
      console.log("Current block number:", blockNumber);
      console.log("Blocks to go:", TARGET_BLOCK_NUMBER - blockNumber);
      await new Promise((resolve) => setTimeout(resolve, timeoutDelay)); // 1000 stands for 1 second, 
                                                                 // change it to whatever you want,
                                                                 // beware of your request limit
      if (TARGET_BLOCK_NUMBER - blockNumber < 4) {
        timeoutDelay = 300; // time to spam check
      }
      blockNumber = await providerMainnet.getBlockNumber();
    }
}

async function claimTokens() {
  const tx = await claimContract.claim();
  return tx.wait();
}


(async function main() {
  await waitForBlockNumber();
  console.log("Claiming tokens...");
  const receipt = await claimTokens();

  if (receipt.status === 1) {
    // Replace with the correct ABI and contract address for the token
    const tokenAbi = [];
    const tokenContractAddress = "";
    const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, wallet);
    const balance = await tokenContract.balanceOf(YOUR_ADDRESS);
    const tx = await tokenContract.transfer(DESTINATION_ADDRESS, balance);
    await tx.wait();
    console.log("Sent tokens to", DESTINATION_ADDRESS);
    } else {
        console.log("Claim failed");
    }
})();
