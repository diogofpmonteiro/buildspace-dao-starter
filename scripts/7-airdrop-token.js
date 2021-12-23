import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// This is the address to our ERC-1155 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule("0x84F4fA90d97324ac6bf218605665EfDC994f8b6B");

// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule("0x69D643fDf1c528F4C8F80DC1A07Ea1FBAbD2d848");

(async () => {
  try {
    // Grab addresses of all owners of our membership NFT, which has a tokenId of 0 on the bundle drop
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!");
      process.exit(0);
    }

    // Loop through the array of addresses using map
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # of tokens between 1000 and 10000 to airdrop to holders
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      // Set up the targets
      const airdropTarget = {
        address,
        // Since we need 18 decimal places
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    // Call transferBatch on all our airdrop targets
    console.log("🌈 Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();
